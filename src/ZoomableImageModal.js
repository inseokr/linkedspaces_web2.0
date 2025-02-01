import React, { useState } from "react";
import { Modal, View, Image, StyleSheet } from "react-native";
import { GestureHandlerRootView, PinchGestureHandler, State } from "react-native-gesture-handler";

const ZoomableImageModal = ({ visible, onClose, imageUri }) => {
  const [scale, setScale] = useState(1);

  const onPinchEvent = (event) => {
    setScale(event.nativeEvent.scale);
  };


  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.modalBackground}>
          <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchEvent}>
            <Image
              source={{ uri: imageUri }}
              style={[styles.image, { transform: [{ scale }] }]}
              resizeMode="contain"
            />
          </PinchGestureHandler>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalBackground: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.8)" },
  image: { width: 300, height: 300 }, // Adjust size as needed
});

export default ZoomableImageModal;
