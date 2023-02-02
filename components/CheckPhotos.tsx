import { StyleSheet, View, TextInput, ScrollView, Image } from "react-native";
import { List, Provider, Text } from "react-native-paper";
import { useRef, useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import * as Location from "expo-location";
import Dialog from "react-native-dialog";
import { Camera, CameraCapturedPicture, PermissionResponse } from "expo-camera";

interface Photo {
  location_reference: number;
  photoUri?: CameraCapturedPicture;
}

interface Props {
  checkPhotosVisible: boolean;
  checkId: number;
  locationTagText: string;
  photos: Photo[];
  closeCheckPhotosDialog: () => void;
}

const db = SQLite.openDatabase("locationlist.db");

const App: React.FC<Props> = (props: Props): React.ReactElement => {
  return (
    <>
      <View style={styles.container}>
        <Dialog.Container visible={props.checkPhotosVisible}>
          <Dialog.Title>Photos from the location</Dialog.Title>
          <ScrollView style={{ padding: 20 }}>
            {props.photos.length > 0 ? (
              <>
                {props.photos.map((photo: Photo, idx: number) => {
                  if (photo.location_reference === props.checkId) {
                    return (
                      <Image
                        style={styles.picture}
                        source={{ uri: String(photo.photoUri) }}
                        key={idx}
                      />
                    );
                  }
                })}
              </>
            ) : (
              <Text>There aren't any saved photos from the location</Text>
            )}
          </ScrollView>
          <Dialog.Button
            label="Return"
            onPress={props.closeCheckPhotosDialog}
          />
        </Dialog.Container>
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
    width: 100,
    height: 200,
    resizeMode: "stretch",
  },
  textfield: {
    margin: 20,
  },
});

export default App;
