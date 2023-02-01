import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, View } from "react-native";
import { Appbar, FAB, Text, Button } from "react-native-paper";
import { Camera, CameraCapturedPicture, PermissionResponse } from "expo-camera";
import { useRef, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

interface Location {
  id: number;
  latitude: number;
  longitude: number;
  date: string;
  tagtext: string;
  infotext: string;
}
interface Picture {
  id: number;
  location_reference: number;
  pictureUri: string;
}
interface cameraInfo {
  camMode: boolean;
  error: string;
  pic?: CameraCapturedPicture;
  info: string;
}

const db = SQLite.openDatabase("locationlist.db");

db.transaction(
  (tx: SQLite.SQLTransaction) => {
    tx.executeSql(`CREATE TABLE IF NOT EXISTS locations (
            id  INTEGER PRIMARY KEY AUTOINCREMENT,
            latitude INTEGER NOT NULL,
            longitude INTEGER NOT NULL,
            date TEXT NOT NULL,
            tagtext TEXT,
            infotext TEXT)`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS pictures (
              id  INTEGER PRIMARY KEY AUTOINCREMENT,
              location_reference INTEGER NOT NULL,
              pictureUri TEXT)`);
  },
  (err: SQLite.SQLError) => {
    console.log(err);
  }
);

const App: React.FC = (): React.ReactElement => {
  const cameraRef: any = useRef<Camera>();

  const [picDescInfo, setPicDescInfo] = useState<cameraInfo>({
    camMode: false,
    error: "",
    info: "",
  });

  const startCamera = async (): Promise<void> => {
    const cameraPermission: PermissionResponse =
      await Camera.requestCameraPermissionsAsync();

    console.log(cameraPermission);

    setPicDescInfo({
      ...picDescInfo,
      camMode: cameraPermission.granted,
      error: !cameraPermission.granted
        ? "No persmission to use the camera."
        : "",
    });
  };

  const takePic = async (): Promise<void> => {
    setPicDescInfo({
      ...picDescInfo,
      info: "Wait a moment...",
    });

    const extraPic: CameraCapturedPicture =
      await cameraRef.current.takePictureAsync();

    setPicDescInfo({
      ...picDescInfo,
      camMode: false,
      pic: extraPic,
      info: "",
    });
  };

  return picDescInfo.camMode ? (
    <Camera style={styles.cameraMode} ref={cameraRef}>
      {Boolean(picDescInfo.info) ? (
        <Text style={{ color: "#fff" }}>{picDescInfo.info}</Text>
      ) : null}

      <FAB
        style={styles.butTakePic}
        icon="camera"
        label="Take a picture"
        onPress={takePic}
      />

      <FAB
        style={styles.butClose}
        icon="close"
        label="Close"
        onPress={() => setPicDescInfo({ ...picDescInfo, camMode: false })}
      />
    </Camera>
  ) : (
    <>
      <SafeAreaProvider>
        <Appbar.Header>
          <Appbar.Content title="Describe and save location details" />
          <Appbar.Action icon="camera" onPress={startCamera} />
        </Appbar.Header>
      </SafeAreaProvider>
      <View style={styles.container}>
        {Boolean(picDescInfo.error) ? <Text>{picDescInfo.error}</Text> : null}

        {Boolean(picDescInfo.pic) ? (
          <Image
            style={styles.picture}
            source={{ uri: picDescInfo.pic!.uri }}
          />
        ) : null}

        <StatusBar style="auto" />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraMode: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  butClose: {
    position: "absolute",
    margin: 20,
    bottom: 0,
    right: 0,
  },
  butTakePic: {
    position: "absolute",
    margin: 20,
    bottom: 0,
    left: 0,
  },
  picture: {
    width: 300,
    height: 400,
    resizeMode: "stretch",
  },
});

export default App;
