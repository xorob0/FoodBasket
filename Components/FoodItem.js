import React from 'react';
import {
  StyleSheet, View, Text, Image, TouchableHighlight, Alert,
} from 'react-native';
import { Icon } from 'react-native-elements';
import DialogInput from 'react-native-dialog-input';
import _ from 'lodash';
import Toast from 'react-native-simple-toast';
import { storeData } from '../DB/DB';


const styles = StyleSheet.create(
  {
    mainContainer: {
      height: 250,
      marginTop: 5,
      flexDirection: 'row',
    },
    image: {
      width: 170,
      height: 250,
      margin: 5,
      resizeMode: 'cover',
      backgroundColor: 'white',
    },
    contentContainer: {
      flex: 1,
      margin: 5,
    },
    contentHeader: {
      flex: 1,
      width: 180,
    },
    contentBarcode: {
      flex: 1,
      width: 180,
    },
    titleText: {
      fontWeight: 'bold',
      fontSize: 22,
      flex: 1,
      flexWrap: 'wrap',
      paddingRight: 5,
      textAlign: 'center',
    },
    barcodeText: {
      fontStyle: 'italic',
      fontSize: 16,
      textAlign: 'center',
    },
    contentIcons: {
      flex: 1,
      marginRight: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    deleteIcons: {
      flex: 0.66,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    plusIcons: {
      flex: 0.33,
      justifyContent: 'flex-end',
    },
  },
);

class FoodItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRemoveDialogVisible: false,
      isAddDialogVisible: false,
    };
  }

  sendInput = (inputText, operation) => {
    const inputNumber = parseInt(inputText, 10);

    // Check if inputText is a valid number
    if (!Number.isNaN(inputNumber) && inputNumber >= 1 && inputNumber <= 20) {
      const { food, screenProps } = this.props;
      let foodName = '';
      foodName = food.product_name_fr !== undefined ? food.product_name_fr : '';
      const foodListTemp = screenProps.foodList;
      const foodListItemIndex = _.findIndex(screenProps.foodList, foodListItem => foodListItem.barcode === food.code);

      // Check if there is already this product in the list
      if (foodListItemIndex !== -1) {
        let quantity = parseInt(foodListTemp[foodListItemIndex].quantity, 10);
        if (operation === 'add') {
          quantity += inputNumber;
          foodListTemp[foodListItemIndex].quantity = quantity;
        } else {
          quantity -= inputNumber;
          if (quantity <= 0) {
          // delete the food object of the foodList array
            foodListTemp.splice(foodListItemIndex, 1);
          } else {
            foodListTemp[foodListItemIndex].quantity = quantity;
          }
        }

        screenProps.updateFoodList(foodListTemp);
        this.setState({ isAddDialogVisible: false, isRemoveDialogVisible: false });
        storeData('foodList', foodListTemp);
        Toast.show(`La quantité de ${foodName} a bien été modifée`);
      } else {
        const foodItem = {};

        foodItem.barcode = food.code;
        foodItem.name = food.product_name_fr;
        foodItem.image = food.image_front_url;
        foodItem.quantity = inputText;

        foodListTemp.push(foodItem);

        screenProps.updateFoodList(foodListTemp);
        this.setState({ isAddDialogVisible: false });
        storeData('foodList', foodListTemp);
        Toast.show(`L'aliment${` ${foodName}`} a bien été ajoutée à la liste`);
      }
    } else {
      this.setState({ isAddDialogVisible: false, isRemoveDialogVisible: false });
      Toast.show('Vous devez rentrer un entier valide compris entre 1 et 20');
    }
  }

  render() {
    const { food, screenProps } = this.props;
    return (
      <TouchableHighlight>
        <View style={styles.mainContainer}>
          <Image
            style={styles.image}
            source={{ uri: food.image_front_url }}
          />

          <View styles={styles.contentContainer}>
            <View style={styles.contentHeader}>
              <Text style={styles.titleText}>
                {food.product_name_fr}
              </Text>
            </View>

            <View style={styles.contentBarcode}>
              <Text style={styles.barcodeText}>
                {food.code}
              </Text>
            </View>

            <View style={styles.contentIcons}>
              {_.find(screenProps.foodList, foodListItem => foodListItem.barcode === food.code)
                ? (
                  <View style={styles.deleteIcons}>
                    <Icon
                      reverse
                      name="delete"
                      type="material-community"
                      color="#517fa4"
                      size={20}
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
                                let foodName = '';
                                foodName = food.product_name_fr !== undefined ? food.product_name_fr : '';
                                const foodListTemp = screenProps.foodList;
                                const foodListItemIndex = _.findIndex(screenProps.foodList, foodListItem => foodListItem.barcode === food.code);
                                foodListTemp.splice(foodListItemIndex, 1);
                                screenProps.updateFoodList(foodListTemp);
                                storeData('foodList', foodListTemp);
                                Toast.show(`Le produit ${foodName} a bien été supprimée`);
                              },
                            },
                          ],
                          { cancelable: true },
                        );
                      }}
                    />
                    <Icon
                      reverse
                      name="playlist-minus"
                      type="material-community"
                      color="#517fa4"
                      size={20}
                      onPress={() => {
                        this.setState({ isRemoveDialogVisible: true });
                      }}
                    />
                  </View>
                )


                : <View />
            }
              <View style={styles.plusIcons}>

                <Icon
                  reverse
                  name="playlist-plus"
                  type="material-community"
                  color="#517fa4"
                  size={20}
                  onPress={() => {
                    this.setState({ isAddDialogVisible: true });
                  }}
                />
              </View>

            </View>
          </View>
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
        </View>
      </TouchableHighlight>
    );
  }
}


export default FoodItem;
