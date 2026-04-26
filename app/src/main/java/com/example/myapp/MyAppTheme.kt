package com.example.myapp

import android.annotation.SuppressLint
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Purple80 = Color(0xFFD0BCFF)
private val PurpleGrey80 = Color(0xFFCCC2DC)
private val Pink80 = Color(0xFFEFB8C8)

private val Purple40 = Color(0xFF6650a4)
private val PurpleGrey40 = Color(0xFF625b71)
private val Pink40 = Color(0xFF885578)

val CustomColors = lightColorScheme(
    primary = Purple80,
    onPrimary = Color.White,
    primaryContainer = Purple90,
    onPrimaryContainer = Purple10,
    secondary = PurpleGrey80,
    onSecondary = Color.White,
    secondaryContainer = PurpleGrey90,
    onSecondaryContainer = PurpleGrey10,
    tertiary = Pink80,
    onTertiary = Color.White,
    tertiaryContainer = Pink90,
    onTertiaryContainer = Pink10,
    error = Color.Red,
    onError = Color.White,
    errorContainer = Color.LightGray,
    onErrorContainer = Color.Red,
    background = Color.White,
    onBackground = Purple40,
    surface = Color.White,
    onSurface = Purple40,
)

@SuppressLint("ComposableNaming")
@Composable
fun MyAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colors = CustomColors
    MaterialTheme(
        colorScheme = colors,
        typography = Typography,
        content = content
    )
}
