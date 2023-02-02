import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, View, TextInput, ScrollView } from "react-native";
import {
  Appbar,
  FAB,
  Text,
  Button,
  List,
  Provider,
  IconButton,
} from "react-native-paper";
import { Camera, CameraCapturedPicture, PermissionResponse } from "expo-camera";
import { useRef, useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";
import * as Location from "expo-location";
import Dialog from "react-native-dialog";
import AddNewLocation from "./components/AddNewLocation";
import DeleteLocation from "./components/DeleteLocation";

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

  const [locations, setLocations] = useState<Location[]>([]);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [locationId, setLocationId] = useState<number>(0);
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [locationTagText, setLocationTagText] = useState<string>("");

  const [picDescInfo, setPicDescInfo] = useState<cameraInfo>({
    camMode: false,
    error: "",
    info: "",
  });

  const searchLocations = () => {
    db.transaction(
      (tx: SQLite.SQLTransaction) => {
        tx.executeSql(
          `SELECT * FROM locations`,
          [],
          (_tx: SQLite.SQLTransaction, rs: SQLite.SQLResultSet) => {
            setLocations(rs.rows._array);
          }
        );
      },
      (err: SQLite.SQLError) => {
        console.log(err);
      }
    );
  };

  const startCamera = async (id: number): Promise<void> => {
    const cameraPermission: PermissionResponse =
      await Camera.requestCameraPermissionsAsync();

    setPicDescInfo({
      ...picDescInfo,
      camMode: cameraPermission.granted,
      error: !cameraPermission.granted
        ? "No persmission to use the camera."
        : "",
    });
    setLocationId(id);
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

  const openAddDialog = async () => {
    setVisible(true);
  };
  const closeAddDialog = async () => {
    setVisible(false);
  };
  const openDeleteDialog = async (id: number, text: string) => {
    setLocationId(id);
    setLocationTagText(text);
    setDeleteVisible(true);
  };
  const closeDeleteDialog = async () => {
    setDeleteVisible(false);
  };
  useEffect(() => {
    searchLocations();
  }, []);

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
      <Provider>
        <Appbar.Header>
          <Appbar.Content title="Save location details" />
        </Appbar.Header>

        <ScrollView style={{ padding: 20 }}>
          {locations.length > 0 ? (
            <>
              {locations.map((location: Location, idx: number) => {
                return (
                  <List.Item
                    title={location.tagtext}
                    key={idx}
                    descriptionNumberOfLines={7}
                    description={
                      "Info: " +
                      location.infotext +
                      "\n" +
                      "lat: " +
                      location.latitude +
                      "\n" +
                      "lon: " +
                      location.longitude +
                      "\n" +
                      location.date
                    }
                    right={(props) => (
                      <IconButton
                        {...props}
                        icon="trash-can"
                        onPress={() => {
                          openDeleteDialog(location.id, location.tagtext);
                        }}
                      />
                    )}
                  />
                );
              })}
            </>
          ) : (
            <Text>There are not any saved location details</Text>
          )}
          <StatusBar style="auto" />
        </ScrollView>
        <FAB
          style={styles.fab}
          icon="map-marker"
          label="Add new Location"
          onPress={() => {
            openAddDialog();
          }}
        />
        <AddNewLocation
          visible={visible}
          closeAddDialog={closeAddDialog}
          searchLocations={searchLocations}
        />
        <DeleteLocation
          deleteVisible={deleteVisible}
          closeDeleteDialog={closeDeleteDialog}
          searchLocations={searchLocations}
          locationId={locationId}
          locationTagText={locationTagText}
        />
      </Provider>
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
  fab: {
    margin: 10,
  },
});

export default App;
