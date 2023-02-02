import { StyleSheet, View, TextInput } from "react-native";
import { useRef, useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import * as Location from "expo-location";
import Dialog from "react-native-dialog";

interface Props {
  deleteVisible: boolean;
  locationId: number;
  locationTagText: string;
  closeDeleteDialog: () => void;
  searchLocations: () => void;
}

const db = SQLite.openDatabase("locationlist.db");

const App: React.FC<Props> = (props: Props): React.ReactElement => {
  const deleteLocation = async () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE from locations WHERE id IN (?)`,
          [props.locationId],
          (_tx, rs) => {
            props.searchLocations();
            props.closeDeleteDialog();
          }
        );
      },
      (err) => {
        console.log(err);
      }
    );
  };

  return (
    <View style={styles.container}>
      <Dialog.Container visible={props.deleteVisible}>
        <Dialog.Title>
          Are you sure you want to delete location with tagtext{" "}
          {props.locationTagText}
        </Dialog.Title>
        <Dialog.Button label="Delete" onPress={deleteLocation} />
        <Dialog.Button label="Cancel" onPress={props.closeDeleteDialog} />
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
