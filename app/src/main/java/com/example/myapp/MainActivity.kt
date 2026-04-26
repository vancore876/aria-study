package com.example.myapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyAppTheme {
                Surface(color = MaterialTheme.colorScheme.background) {
                    MyAppNavHost()
                }
            }
        }
    }
}

@Composable
fun MyAppNavHost() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "home") {
        composable("home") { HomeScreen(navController) }
        composable("settings") { SettingsScreen(navController) }
    }
}

@Composable
fun HomeScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My App") },
                actions = {
                    IconButton(onClick = { navController.navigate("settings") }) {
                        Icon(imageVector = Icons.Default.Settings, contentDescription = "Settings")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = padding.padding(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Welcome to the Home Screen", style = MaterialTheme.typography.headlineMedium)
            Button(onClick = { /* Add functionality */ }) {
                Text("Click Me")
            }
        }
    }
}

@Composable
fun SettingsScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = padding.padding()) {
            Text("Settings Screen Content", style = MaterialTheme.typography.headlineSmall)
            // Add more settings UI elements here
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    MyAppTheme {
        MyAppNavHost()
    }
}
