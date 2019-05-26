import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import { SearchBar, Icon, ListItem } from 'react-native-elements';
import DialogInput from 'react-native-dialog-input';
import _ from 'lodash';
import Toast from 'react-native-simple-toast';
import { searchFoodByName } from '../API/OFFApi';
import { storeData } from '../DB/DB';

export default class componentName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      showLoading: false,
      isDialogVisible: false,
    };
    this.page = 1;
    this.totalPages = 1;
    this.food = {};
  }

  updateSearch = (search) => {
    this.page = 1;
    this.totalPages = 1;
    this.setState({ search });
    this.displayFoods(search);
  };

  displayFoods = (search) => {
    if (search !== '') {
      this.setState({ showLoading: true });
      searchFoodByName(search, this.pageToReach).then((data) => {
        /*  // Defining the max food displayed
        if ((data.count > 0 && data.count < 700) || data.count === 0) */
        this.totalPages = Math.ceil(data.count / 20);
        this.setState({ data: data.products });

        this.setState({ showLoading: false });
      });
    } else {
      this.setState({ data: [] });
    }
  }

  addFoodToShoppingList = (inputText) => {
    const inputNumber = parseInt(inputText, 10);

    if (!Number.isNaN(inputNumber) && inputNumber >= 1 && inputNumber <= 20) {
      const { screenProps } = this.props;
      const foodName = this.food.product_name_fr !== undefined ? this.food.product_name_fr : '';

      const shoppingListTemp = screenProps.shoppingList;
      const shoppingListItemIndex = _.findIndex(screenProps.shoppingList, foodListItem => foodListItem.barcode === this.food.code);

      if (shoppingListItemIndex !== -1) {
        let quantity = parseInt(shoppingListTemp[shoppingListItemIndex].quantity, 10);
        quantity += inputNumber;
        shoppingListTemp[shoppingListItemIndex].quantity = quantity;
        Toast.show(`La quantité de ${`${foodName}`} a bien été modifié dans la liste de course`);
      } else {
        const shoppingItem = {};

        shoppingItem.barcode = this.food.code;
        shoppingItem.name = foodName;
        shoppingItem.imageFront = this.food.image_front_url;
        shoppingItem.quantity = inputText;

        shoppingListTemp.push(shoppingItem);
        Toast.show(`L'aliment ${`${foodName}`} a bien été ajoutée à la liste de course`);
      }

      screenProps.updateShoppingList(shoppingListTemp);
      this.setState({ isDialogVisible: false });
      storeData('shoppingList', shoppingListTemp);
    }
  }

  keyExtractor = (item, index) => index.toString()

  renderItem = ({ item }) => (
    <ListItem
      key={item.code}
      title={item.product_name_fr}
      titleStyle={{ fontSize: 20 }}
      leftAvatar={{
        source: { uri: item.image_front_url },
        size: 'large',
        rounded: false,
        avatarStyle: { borderRadius: 20 },
        overlayContainerStyle: { backgroundColor: 'transparent' },
      }}
      bottomDivider
      rightIcon={(
        <Icon
          name="cart-plus"
          type="material-community"
          color="#517fa4"
          size={36}
          onPress={() => {
            this.setState({ isDialogVisible: true });
            this.food = item;
          }}
        />
      )}
    />
  )

  render() {
    const { search } = this.state;

    return (
      <View>
        <SearchBar
          placeholder="Entrer le nom du produit"
          onChangeText={this.updateSearch}
          value={search}
          lightTheme
          round
          showLoading={this.state.showLoading}
          inputStyle={{ color: 'black' }}
          searchIcon={(
            <Icon
              name="magnify"
              type="material-community"
              color="black"
            />
        )}
        />

        <FlatList
          keyExtractor={this.keyExtractor}
          data={this.state.data}
          renderItem={this.renderItem}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            this.page += 1;
            if (this.state.data.length > 0 && this.page < this.totalPages) {
              this.setState({ showLoading: true });
              searchFoodByName(search, this.page).then((data) => {
                // eslint-disable-next-line react/no-access-state-in-setstate
                this.setState({ data: [...this.state.data, ...data.products], showLoading: false });
              });
            }
          }}
        />
        <DialogInput
          isDialogVisible={this.state.isDialogVisible}
          title="Quantité à ajouter"
          message="Entrer la quantité du produit à ajouter à votre liste de course"
          submitText="Ajouter"
          cancelText="Annuler"
          textInputProps={{ keyboardType: 'numeric' }}
          submitInput={inputText => this.addFoodToShoppingList(inputText)}
          closeDialog={() => this.setState({ isDialogVisible: false })}
        />
      </View>
    );
  }
}