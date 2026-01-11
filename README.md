# AR Shooter Project

A mobile Augmented Reality (AR) First-Person Shooter game built with Unity and AR Foundation. This application detects physical surfaces (planes) in the real world to spawn virtual targets, allowing players to aim and shoot using their mobile device.

## 📖 Description

The primary purpose of this project is to demonstrate the capabilities of mobile AR by blending virtual gameplay with the physical environment. 

**Key Functionalities:**
* **Plane Detection:** Uses the device camera to identify floors, tables, and walls.
* **Raycast Mechanics:** Implements tap-to-shoot functionality using screen-to-world raycasting.
* **Dynamic Spawning:** Enemies/targets appear randomly on detected surfaces.
* **Score Tracking:** A local system to track hits and high scores during a session.

## 🛠 Prerequisites

Before installing, ensure you have the following software and hardware:

* **Unity Hub** and **Unity Editor** (Version 2022.3 LTS or higher recommended).
* **AR Foundation Package** (installed via Unity Package Manager).
* **Mobile Device:**
    * **Android:** Supports ARCore (Android 7.0+).
    * **iOS:** Supports ARKit (iPhone 6S or newer, iOS 11+).

## ⚙️ Installation

Follow these steps to set up the project locally:

1.  **Clone the Repository**
    Open your terminal or command prompt and run:
    ```bash
    git clone [https://github.com/your-username/ar-shooter-project.git](https://github.com/your-username/ar-shooter-project.git)
    ```

2.  **Open in Unity**
    * Launch Unity Hub.
    * Click **Add** and select the cloned project folder.
    * Open the project (this may take a few minutes to import assets).

3.  **Install Dependencies**
    * If Unity warns about missing packages, go to `Window > Package Manager`.
    * Ensure **AR Foundation**, **ARCore XR Plugin** (for Android), and **ARKit XR Plugin** (for iOS) are installed and up to date.

4.  **Build to Device**
    * Connect your mobile device via USB.
    * Go to `File > Build Settings`.
    * Select your platform (**Android** or **iOS**) and click **Switch Platform**.
    * Click **Build and Run**.

## 🎮 Usage

1.  Launch the app on your mobile device.
2.  Allow camera permissions when prompted.
3.  Move the phone slowly side-to-side to scan the floor or a table until a grid/dots appear (visualizing the plane).
4.  Tap the screen to shoot at the targets that spawn on the grid.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
