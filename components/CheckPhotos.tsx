import { StyleSheet, View, TextInput } from "react-native";
import { useRef, useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import * as Location from "expo-location";
import Dialog from "react-native-dialog";

interface Props {
  checkPhotosVisible: boolean;
  locationId: number;
  locationTagText: string;
  closeCheckPhotosDialog: () => void;
}

const db = SQLite.openDatabase("locationlist.db");

const App: React.FC<Props> = (props: Props): React.ReactElement => {
  return (
    <View style={styles.container}>
      <Dialog.Container visible={props.checkPhotosVisible}>
        <Dialog.Title>Photos from the location</Dialog.Title>

        <Dialog.Button label="Return" onPress={props.closeCheckPhotosDialog} />
      </Dialog.Container>
    </View>
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
  textfield: {
    margin: 20,
  },
});

export default App;
