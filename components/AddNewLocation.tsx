import { StyleSheet, View, TextInput } from "react-native";
import { useRef, useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import * as Location from "expo-location";
import Dialog from "react-native-dialog";

interface Props {
  visible: boolean;
  closeAddDialog: () => void;
  searchLocations: () => void;
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
  },
  (err: SQLite.SQLError) => {
    console.log(err);
  }
);

const App: React.FC<Props> = (props: Props): React.ReactElement => {
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const [tagText, setTagText] = useState<string>("");
  const [infoText, setInfoText] = useState<string>("");

  const searchCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    if (location.coords.latitude === null) {
      searchCurrentLocation();
    }
    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
    let extraDay = new Date(location.timestamp);
    let day =
      "Day: " +
      extraDay.getDate() +
      "/" +
      (extraDay.getMonth() + 1) +
      "/" +
      extraDay.getFullYear() +
      " Time: " +
      extraDay.getHours() +
      ":" +
      extraDay.getMinutes();
    setDate(String(day));
  };

  const addNewLocation = async () => {
    db.transaction(
      (tx: SQLite.SQLTransaction) => {
        tx.executeSql(
          `INSERT INTO locations (tagtext, infotext, latitude, longitude, date) VALUES (?,?,?,?,?)`,
          [String(tagText), String(infoText), latitude, longitude, date],
          (_tx: SQLite.SQLTransaction, rs: SQLite.SQLResultSet) => {
            props.searchLocations();
            props.closeAddDialog();
          }
        );
      },
      (err: SQLite.SQLError) => {
        console.log(err);
      }
    );
  };
  useEffect(() => {
    searchCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Dialog.Container visible={props.visible}>
        <Dialog.Title>Add new location</Dialog.Title>

        <TextInput
          onChangeText={(text) => setTagText(text)}
          placeholder="Add tagtext"
          style={styles.textfield}
        />
        <TextInput
          onChangeText={(text) => setInfoText(text)}
          placeholder="Add infotext"
          style={styles.textfield}
        />

        <Dialog.Button label="Save" onPress={addNewLocation} />
        <Dialog.Button label="Cancel" onPress={props.closeAddDialog} />
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
