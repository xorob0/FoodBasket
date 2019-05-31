import React, { Component } from 'react';
import {
  View, Text, Modal, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Alert,
} from 'react-native';
import { Badge, Icon, Input } from 'react-native-elements';
import ImageViewer from 'react-native-image-zoom-viewer';
import _ from 'lodash';
import Toast from 'react-native-simple-toast';
import DialogInput from 'react-native-dialog-input';
import DatePicker from 'react-native-datepicker';
import PushNotification from 'react-native-push-notification';
import { storeData } from '../DB/DB';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);


const styles = StyleSheet.create({
  image: {
    width: screenWidth / 3,
    height: screenWidth / 3,
    resizeMode: 'contain',
    marginTop: 3,
    marginBottom: 3,
  },
  viewContainer: {
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 22,
    flexWrap: 'wrap',
    paddingRight: 5,
    textAlign: 'center',
  },
  extraText: {
    fontStyle: 'italic',
    fontSize: 16,
    textAlign: 'center',
  },
});
export default class FoodOptions extends Component {
  constructor(props) {
    super(props);
    this.food = _.find(this.props.screenProps.foodList, food => food.barcode === this.props.navigation.state.params.barcode);
    this.foodName = this.food.name !== undefined ? this.food.name : '';

    this.state = {
      isVisible: false,
      isAddDialogVisible: false,
      isAddShoppingVisible: false,
      isRemoveDialogVisible: false,
      date: this.food.expirationDate,
    };
  }

  sendInput = (inputText, operation) => {
    const inputNumber = parseInt(inputText, 10);

    // Check if inputText is a valid number
    if (!Number.isNaN(inputNumber) && inputNumber >= 1 && inputNumber <= 20) {
      const { screenProps } = this.props;
      const foodListTemp = screenProps.foodList;
      const foodListItemIndex = _.findIndex(screenProps.foodList, foodListItem => foodListItem.barcode === this.food.barcode);
      const food = foodListTemp[foodListItemIndex];
      let quantity = parseInt(this.food.quantity, 10);

      if (operation === 'add') {
        quantity += inputNumber;
        food.quantity = quantity;
      } else {
        quantity -= inputNumber;
        if (quantity <= 0) {
          // delete the food object of the foodList array
          foodListTemp.splice(foodListItemIndex, 1);
        } else {
          food.quantity = quantity;
        }
      }
      this.setState({ isAddDialogVisible: false, isRemoveDialogVisible: false });
      screenProps.updateFoodList(foodListTemp);
      storeData('foodList', foodListTemp);
      Toast.show(`La quantité de ${this.foodName} a bien été modifée`);

      // Check if the quantity has reach the limit
      if (quantity <= parseInt(food.minQuantity, 10)) {
        this.addFoodToShoppingList(1, 'automatique');
      }
    } else {
      this.setState({ isAddDialogVisible: false, isRemoveDialogVisible: false });
      Toast.show('Vous devez rentrer un entier valide compris entre 1 et 20');
    }
  }

  addFoodToShoppingList = (inputText, operation) => {
    const { screenProps } = this.props;
    const shoppingListTemp = screenProps.shoppingList;
    const shoppingListItemIndex = _.findIndex(screenProps.shoppingList, shoppingListItem => shoppingListItem.barcode === this.food.barcode);
    const foodToAdd = this.food;
    const quantity = parseInt(inputText, 10);
    if (shoppingListItemIndex === -1) {
      foodToAdd.quantity = quantity;
      shoppingListTemp.push(foodToAdd);
      this.setState({ isAddShoppingVisible: false });
      screenProps.updateShoppingList(shoppingListTemp);
      storeData('shoppingList', shoppingListTemp);
    } else if (operation === 'manuel') {
      // manuel + there is already the product
      shoppingListTemp[shoppingListItemIndex].quantity = quantity + parseInt(shoppingListTemp[shoppingListItemIndex].quantity, 10);
      this.setState({ isAddShoppingVisible: false });
      screenProps.updateShoppingList(shoppingListTemp);
      storeData('shoppingList', shoppingListTemp);
    }

    Toast.show(`Le produit ${this.foodName}a bien été ajouté à votre liste de course`);
  }

  render() {
    const { screenProps } = this.props;

    return (
      <View>
        <ScrollView>
          <Modal
            visible={this.state.isVisible}
            onRequestClose={() => this.setState({ isVisible: false })}
            animationType="fade"
            transparent
          >
            <ImageViewer imageUrls={[{ url: this.food.imageFront }]} />
          </Modal>
          <View style={[styles.viewContainer, { elevation: 2 }]}>
            <TouchableOpacity
              onPress={() => this.setState({ isVisible: true })}
            >
              <Image
                source={{ uri: this.food.imageFront }}
                style={styles.image}
              />
              <Text style={styles.extraText}>{this.food.barcode}</Text>
            </TouchableOpacity>
            <View style={{ justifyContent: 'center' }}>
              <View style={{ width: screenWidth - screenWidth / 2.8 }}>
                <Text style={styles.titleText}>{this.foodName}</Text>
              </View>

              <View>
                <View style={{ width: screenWidth - screenWidth / 2.8, marginTop: 5 }}>
                  <Text style={styles.extraText}>{this.food.brands}</Text>
                </View>

                <View style={{ width: screenWidth - screenWidth / 2.8, marginTop: 5 }}>
                  <Text style={styles.extraText}>{this.food.productWeight}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.viewContainer, { marginTop: 20 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.titleText}> Quantité: </Text>
              <Badge value={`x ${this.food.quantity} `} badgeStyle={{ backgroundColor: '#517fa4', height: 25 }} textStyle={{ fontSize: 18 }} />
              <View style={{ width: screenWidth / 1.85 }}>
                <View style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>
                  <Icon
                    reverse
                    name="playlist-plus"
                    type="material-community"
                    color="#517fa4"
                    size={16}
                    onPress={() => {
                      this.setState({ isAddDialogVisible: true });
                    }}
                  />
                  <Icon
                    reverse
                    name="playlist-minus"
                    type="material-community"
                    color="#517fa4"
                    size={16}
                    onPress={() => {
                      this.setState({ isRemoveDialogVisible: true });
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.viewContainer, { marginTop: 30, alignItems: 'center' }]}>
            <Text style={[styles.titleText, { fontSize: 16 }]}> Date de péremption: </Text>
            <DatePicker
              style={{ width: 195 }}
              date={this.state.date}
              mode="date"
              androidMode="spinner"
              placeholder="Sélection"
              minDate={new Date().toISOString().substring(0, 10)}
              format="YYYY-MM-DD"
              confirmBtnText="Confirmer"
              cancelBtnText="Annuler"
              customStyles={{
                dateIcon: {
                  position: 'absolute',
                  right: 0,
                  top: 4,
                  marginRight: 65,
                },
                dateInput: {
                  marginLeft: 1,
                  marginRight: '55%',
                },
              }}
              onDateChange={(date) => {
                this.setState({ date });
                const foodListItemIndex = _.findIndex(screenProps.foodList, foodListItem => foodListItem.barcode === this.food.barcode);
                const foodListTemp = screenProps.foodList;
                foodListTemp[foodListItemIndex].expirationDate = date;
                screenProps.updateFoodList(foodListTemp);
                storeData('foodList', foodListTemp);

                PushNotification.localNotificationSchedule({
                  /* Android Only Properties */
                  id: `${this.food.barcode.slice(0, 8)}1`, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
                  autoCancel: true, // (optional) default: true
                  largeIcon: 'ic_launcher', // (optional) default: "ic_launcher"
                  smallIcon: 'ic_notification', // (optional) default: "ic_notification" with fallback for "ic_launcher"
                  bigText: `Attention, votre aliment ${this.foodName} sera périmé dans 1 semaine`, // (optional) default: "message" prop
                  vibrate: true, // (optional) default: true
                  vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
                  ongoing: false, // (optional) set whether this is an "ongoing" notification
                  priority: 'high', // (optional) set notification priority, default: high
                  visibility: 'private', // (optional) set notification visibility, default: private
                  importance: 'high', // (optional) set notification importance, default: high

                  /* iOS and Android properties */
                  title: 'Avertissement de péremption', // (optional)
                  message: `Attention, votre aliment ${this.foodName} sera périmé dans 1 semaine`, // (required)
                  playSound: true, // (optional) default: true
                  soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
                  number: '10', // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
                  date: new Date(new Date(date).getTime() - (604800 * 1000)), // in 60 secs
                });

                PushNotification.localNotificationSchedule({
                  /* Android Only Properties */
                  id: `${this.food.barcode.slice(0, 8)}2`, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
                  autoCancel: true, // (optional) default: true
                  largeIcon: 'ic_launcher', // (optional) default: "ic_launcher"
                  smallIcon: 'ic_notification', // (optional) default: "ic_notification" with fallback for "ic_launcher"
                  bigText: `Attention, votre aliment ${this.foodName} sera périmé dans 2 jours`, // (optional) default: "message" prop
                  vibrate: true, // (optional) default: true
                  vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
                  ongoing: false, // (optional) set whether this is an "ongoing" notification
                  priority: 'high', // (optional) set notification priority, default: high
                  visibility: 'private', // (optional) set notification visibility, default: private
                  importance: 'high', // (optional) set notification importance, default: high

                  /* iOS and Android properties */
                  title: 'Avertissement de péremption', // (optional)
                  message: `Attention, votre aliment ${this.foodName} sera périmé dans 2 jours`, // (required)
                  playSound: true, // (optional) default: true
                  soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
                  number: '10', // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
                  date: new Date(new Date(date).getTime() - ((86400 * 2) * 1000)), // in 60 secs
                });
              }}
            />
          </View>
          <View style={[styles.viewContainer, { marginTop: 30, alignItems: 'center' }]}>
            <Text style={[styles.titleText, { fontSize: 16 }]}> Quantité minimale: </Text>
            <Input
              placeholder="Entrer une valeur"
              containerStyle={{
                width: 135, height: 40, borderWidth: 1, borderColor: '#9c9c9c',
              }}
              placeholderTextColor="#c4c4c4"
              inputContainerStyle={{ borderBottomWidth: 0 }}
              inputStyle={{ fontSize: 14 }}
              keyboardType="number-pad"
              onSubmitEditing={(value) => {
                const inputValue = value.nativeEvent.text;
                if (!Number.isNaN(inputValue) && inputValue >= 1 && inputValue <= 20) {
                  const foodListTemp = screenProps.foodList;
                  const foodListItemIndex = _.findIndex(screenProps.foodList, foodListItem => foodListItem.barcode === this.food.barcode);
                  foodListTemp[foodListItemIndex].minQuantity = value.nativeEvent.text;
                  screenProps.updateFoodList(foodListTemp);
                  storeData('foodList', foodListTemp);
                  if (parseInt(value.nativeEvent.text, 10) >= parseInt(this.food.quantity, 10)) {
                    this.addFoodToShoppingList(1, 'automatique');
                  }
                  Toast.show('La quantité minimale pour ce produit a bien été modifié');
                } else {
                  Toast.show('Vous devez rentrer un entier valide compris entre 1 et 20');
                }
              }}
              defaultValue={this.food.minQuantity}

            />

          </View>
          <View style={{ height: screenHeight / 6, flexDirection: 'row' }}>
            <Icon
              reverse
              containerStyle={{ position: 'absolute', bottom: 10, right: 65 }}
              name="cart-arrow-down"
              type="material-community"
              color="#517fa4"
              size={18}
              onPress={() => this.setState({ isAddShoppingVisible: true })}
            />

            <Icon
              reverse
              containerStyle={{ position: 'absolute', bottom: 10, right: 10 }}
              name="delete"
              type="material-community"
              color="#517fa4"
              size={18}
              onPress={() => {
                Alert.alert(
                  'Confirmation de suppression',
                  'Voulez-vous supprimer ce produit de votre liste ?',
                  [
                    {
                      text: 'Non',
                      style: 'cancel',
                    },
                    {
                      text: 'Oui',
                      onPress: () => {
                        const foodListTemp = screenProps.foodList;
                        const foodListItemIndex = _.findIndex(screenProps.foodList, foodListItem => foodListItem.barcode === this.food.barcode);
                        foodListTemp.splice(foodListItemIndex, 1);
                        screenProps.updateFoodList(foodListTemp);
                        storeData('foodList', foodListTemp);
                        Toast.show(`Le produit ${this.foodName} a bien été supprimée`);
                        this.props.navigation.goBack(null);
                      },
                    },
                  ],
                  { cancelable: true },
                );
              }}
            />
          </View>
        </ScrollView>
        <DialogInput
          isDialogVisible={this.state.isRemoveDialogVisible}
          title="Quantité à supprimer"
          message="Entrer la quantité du produit à supprimer de la liste"
          submitText="Supprimer"
          cancelText="Annuler"
          textInputProps={{ keyboardType: 'numeric' }}
          submitInput={inputText => this.sendInput(inputText, 'delete')}
          closeDialog={() => this.setState({ isRemoveDialogVisible: false })}
        />

        <DialogInput
          isDialogVisible={this.state.isAddDialogVisible}
          title="Quantité à ajouter"
          message="Entrer la quantité du produit à ajouter à la liste"
          submitText="Ajouter"
          cancelText="Annuler"
          textInputProps={{ keyboardType: 'numeric' }}
          submitInput={inputText => this.sendInput(inputText, 'add')}
          closeDialog={() => this.setState({ isAddDialogVisible: false })}
        />

        <DialogInput
          isDialogVisible={this.state.isAddShoppingVisible}
          title="Quantité à ajouter"
          message="Entrer la quantité du produit à ajouter à la liste de courses"
          submitText="Ajouter"
          cancelText="Annuler"
          textInputProps={{ keyboardType: 'numeric' }}
          submitInput={inputText => this.addFoodToShoppingList(inputText, 'manuel')}
          closeDialog={() => this.setState({ isAddShoppingVisible: false })}
        />
      </View>
    );
  }
}
