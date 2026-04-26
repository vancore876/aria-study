import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  LocalLLMService,
  LOCAL_MODELS,
  DownloadProgress,
  ModelStatus,
} from '../services/LocalLLMService';

const COLORS = {
  bg: '#0a0a0f',
  surface: '#13131a',
  surface2: '#1a1a28',
  accent: '#00d4ff',
  accent2: '#7c3aed',
  text: '#e8e8f0',
  muted: '#737396',
  border: '#1e1e35',
  green: '#00ff88',
  red: '#ff4466',
  orange: '#ff9500',
};

const TIER_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  groq: { label: 'Cloud AI', color: COLORS.accent, icon: 'cloud' },
  local: { label: 'On Device', color: COLORS.green, icon: 'phone-portrait' },
  pattern: { label: 'Fallback', color: COLORS.orange, icon: 'flash' },
};

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} />
    </View>
  );
}

function SpinnerIcon({ color }: { color: string }) {
  const spin = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Ionicons name="sync" size={16} color={color} />
    </Animated.View>
  );
}

export default function ModelsScreen() {
  const [statuses, setStatuses] = useState<ModelStatus[]>([]);
  const [downloads, setDownloads] = useState<Record<string, DownloadProgress>>({});
  const [loadingModel, setLoadingModel] = useState<string | null>(null);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const s = await LocalLLMService.getModelStatuses();
    setStatuses(s);
    const a = await LocalLLMService.getActiveModelId();
    setActiveModelId(a);
  }, []);

  useEffect(() => { refresh(); }, []);

  const handleDownload = (modelId: string) => {
    const model = LOCAL_MODELS.find(m => m.id === modelId)!;
    Alert.alert(
      `Download ${model.name}?`,
      `Size: ${model.size}\nRequires: ${model.ram}\n\nYou can keep using ARIA Study while it downloads.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            setDownloads(prev => ({
              ...prev,
              [modelId]: { modelId, bytesWritten: 0, totalBytes: model.sizeBytes, percent: 0, status: 'downloading' },
            }));

            LocalLLMService.downloadModel(
              modelId,
              (progress) => setDownloads(prev => ({ ...prev, [modelId]: progress })),
              () => {
                refresh();
                setDownloads(prev => {
                  const next = { ...prev };
                  delete next[modelId];
                  return next;
                });
                Alert.alert('Download complete', `${model.name} is ready for offline study.`);
              },
              (err) => {
                Alert.alert('Download Failed', err);
                setDownloads(prev => {
                  const next = { ...prev };
                  delete next[modelId];
                  return next;
                });
              }
            );
          }
        }
      ]
    );
  };

  const handleLoad = async (modelId: string) => {
    const model = LOCAL_MODELS.find(m => m.id === modelId)!;
    setLoadingModel(modelId);

    const ok = await LocalLLMService.loadModel(modelId, (msg) => console.log(msg));
    setLoadingModel(null);

    if (ok) {
      await LocalLLMService.setActiveModel(modelId);
      setActiveModelId(modelId);
      refresh();
      Alert.alert('Model loaded', `${model.name} is ready for offline study support.`);
    } else {
      Alert.alert('Load Failed', LocalLLMService.getUnavailableReason() || 'Could not load the model. Make sure you have enough RAM and are using a dev build or APK rather than Expo Go.');
    }
  };

  const handleUnload = async () => {
    await LocalLLMService.unloadModel();
    setActiveModelId(null);
    refresh();
  };

  const handleDelete = (modelId: string) => {
    const model = LOCAL_MODELS.find(m => m.id === modelId)!;
    Alert.alert(
      `Delete ${model.name}?`,
      `This will remove the ${model.size} model file from your device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await LocalLLMService.deleteModel(modelId);
            refresh();
          }
        }
      ]
    );
  };

  const handleCancelDownload = (modelId: string) => {
    LocalLLMService.cancelDownload();
    setDownloads(prev => {
      const next = { ...prev };
      delete next[modelId];
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Local AI Models</Text>
          <Text style={styles.headerSub}>Download once, study offline whenever you need.</Text>
        </View>

        <View style={styles.tierCard}>
          <Text style={styles.tierTitle}>How ARIA Study answers</Text>
          <View style={styles.tierRow}>
            {(['groq', 'local', 'pattern'] as const).map((tier, i) => (
              <View key={tier} style={styles.tierItem}>
                <View style={[styles.tierBadge, { backgroundColor: TIER_LABELS[tier].color + '20', borderColor: TIER_LABELS[tier].color + '50' }]}>
                  <Ionicons name={TIER_LABELS[tier].icon as any} size={14} color={TIER_LABELS[tier].color} />
                  <Text style={[styles.tierBadgeText, { color: TIER_LABELS[tier].color }]}>
                    {i + 1}. {TIER_LABELS[tier].label}
                  </Text>
                </View>
                {i < 2 && <Ionicons name="arrow-forward" size={12} color={COLORS.muted} style={{ marginHorizontal: 2 }} />}
              </View>
            ))}
          </View>
          <Text style={styles.tierDesc}>
            ARIA tries cloud AI first when online mode is enabled. If that is unavailable, it uses your local model, then a built-in study fallback.
          </Text>
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.orange} />
          <Text style={styles.noteText}>
            Local models download in Expo Go, but inference only loads in a dev build or APK with native modules enabled.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Models</Text>

          {LOCAL_MODELS.map(model => {
            const status = statuses.find(s => s.modelId === model.id);
            const dl = downloads[model.id];
            const isActive = activeModelId === model.id;
            const isLoaded = LocalLLMService.getLoadedModelId() === model.id;
            const isLoading = loadingModel === model.id;
            const isDownloading = dl?.status === 'downloading' || dl?.status === 'verifying';

            return (
              <View key={model.id} style={[styles.modelCard, isActive && styles.modelCardActive, model.recommended && styles.modelCardRecommended]}>
                {model.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}

                <View style={styles.modelHeader}>
                  <View style={styles.modelInfo}>
                    <Text style={styles.modelName}>{model.name}</Text>
                    <Text style={styles.modelDesc}>{model.description}</Text>
                    <View style={styles.modelMeta}>
                      <View style={styles.metaTag}>
                        <Ionicons name="server-outline" size={11} color={COLORS.muted} />
                        <Text style={styles.metaText}>{model.size}</Text>
                      </View>
                      <View style={styles.metaTag}>
                        <Ionicons name="hardware-chip-outline" size={11} color={COLORS.muted} />
                        <Text style={styles.metaText}>{model.ram}</Text>
                      </View>
                      <View style={styles.metaTag}>
                        <Ionicons name="chatbubble-outline" size={11} color={COLORS.muted} />
                        <Text style={styles.metaText}>{model.contextLength / 1000}K ctx</Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.statusDot,
                    isLoaded ? styles.statusGreen :
                    status?.isDownloaded ? styles.statusBlue :
                    styles.statusGray
                  ]} />
                </View>

                {isDownloading && dl && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <View style={styles.progressLabelRow}>
                        <SpinnerIcon color={COLORS.accent} />
                        <Text style={styles.progressLabel}>
                          {dl.status === 'verifying' ? 'Verifying...' : `Downloading ${dl.percent}%`}
                        </Text>
                      </View>
                      <Text style={styles.progressBytes}>
                        {LocalLLMService.formatBytes(dl.bytesWritten)} / {LocalLLMService.formatBytes(dl.totalBytes)}
                      </Text>
                    </View>
                    <ProgressBar percent={dl.percent} color={COLORS.accent} />
                    <TouchableOpacity onPress={() => handleCancelDownload(model.id)} style={styles.cancelDlBtn}>
                      <Text style={styles.cancelDlText}>Pause Download</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!isDownloading && (
                  <View style={styles.modelActions}>
                    {!status?.isDownloaded ? (
                      <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(model.id)}>
                        <Ionicons name="cloud-download-outline" size={16} color="#fff" />
                        <Text style={styles.downloadBtnText}>Download {model.size}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.downloadedActions}>
                        {isLoaded ? (
                          <View style={styles.activeRow}>
                            <View style={styles.activeBadge}>
                              <Ionicons name="checkmark-circle" size={14} color={COLORS.green} />
                              <Text style={styles.activeText}>Active and loaded</Text>
                            </View>
                            <TouchableOpacity style={styles.unloadBtn} onPress={handleUnload}>
                              <Text style={styles.unloadBtnText}>Unload</Text>
                            </TouchableOpacity>
                          </View>
                        ) : isLoading ? (
                          <View style={styles.loadingRow}>
                            <SpinnerIcon color={COLORS.accent2} />
                            <Text style={styles.loadingText}>Loading into memory...</Text>
                          </View>
                        ) : (
                          <TouchableOpacity style={styles.loadBtn} onPress={() => handleLoad(model.id)}>
                            <Ionicons name="play-circle-outline" size={16} color="#fff" />
                            <Text style={styles.loadBtnText}>Load Model</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(model.id)}>
                          <Ionicons name="trash-outline" size={15} color={COLORS.red} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {status?.isDownloaded && status.fileSizeBytes && (
                  <Text style={styles.diskSize}>
                    On device: {LocalLLMService.formatBytes(status.fileSizeBytes)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Tips</Text>
          {[
            'Download on WiFi - models are 0.6 to 2.2 GB',
            'First load takes 10 to 30 seconds because it loads into RAM',
            'Once loaded, responses take 3 to 8 seconds on most phones',
            'Unload the model when not using it to free RAM',
            'Phi-3 Mini gives the best answers for homework, CXC practice, and college study',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipDot}>-</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 96 },
  header: { padding: 20, paddingBottom: 8 },
  headerTitle: { color: COLORS.text, fontSize: 23, fontWeight: '800' },
  headerSub: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  tierCard: {
    margin: 12, marginTop: 4, backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  tierTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' },
  tierRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  tierItem: { flexDirection: 'row', alignItems: 'center' },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1,
  },
  tierBadgeText: { fontSize: 11, fontWeight: '600' },
  tierDesc: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  noteCard: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    marginHorizontal: 12, marginBottom: 12, backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  noteText: { color: COLORS.muted, fontSize: 12, lineHeight: 18, flex: 1 },
  section: { marginHorizontal: 12, marginBottom: 8 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  modelCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  modelCardActive: { borderColor: COLORS.green + '60' },
  modelCardRecommended: { borderColor: COLORS.accent2 + '60' },
  recommendedBadge: {
    backgroundColor: COLORS.accent2 + '20', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 10,
  },
  recommendedText: { color: COLORS.accent2, fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  modelHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  modelInfo: { flex: 1 },
  modelName: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 },
  modelDesc: { color: COLORS.muted, fontSize: 13, marginTop: 3, lineHeight: 18 },
  modelMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  metaTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.surface2, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  metaText: { color: COLORS.muted, fontSize: 11 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  statusGreen: { backgroundColor: COLORS.green },
  statusBlue: { backgroundColor: COLORS.accent },
  statusGray: { backgroundColor: COLORS.muted },
  progressSection: { marginTop: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  progressBytes: { color: COLORS.muted, fontSize: 11 },
  progressTrack: { height: 6, backgroundColor: COLORS.surface2, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  cancelDlBtn: { marginTop: 8, alignSelf: 'flex-end' },
  cancelDlText: { color: COLORS.muted, fontSize: 12 },
  modelActions: { marginTop: 14 },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.accent2, borderRadius: 12, paddingVertical: 11,
  },
  downloadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  downloadedActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.green + '15', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  activeText: { color: COLORS.green, fontWeight: '600', fontSize: 13 },
  unloadBtn: {
    backgroundColor: COLORS.surface2, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  unloadBtnText: { color: COLORS.muted, fontSize: 12 },
  loadingRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: COLORS.muted, fontSize: 13 },
  loadBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: COLORS.accent2 + 'cc', borderRadius: 12, paddingVertical: 10,
  },
  loadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  deleteBtn: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.red + '15',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.red + '30',
  },
  diskSize: { color: COLORS.muted, fontSize: 11, marginTop: 8 },
  infoCard: {
    margin: 12, backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  infoTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: 15, marginBottom: 10 },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipDot: { color: COLORS.accent, fontSize: 14 },
  tipText: { color: COLORS.muted, fontSize: 13, flex: 1, lineHeight: 20 },
});
