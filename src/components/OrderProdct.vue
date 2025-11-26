<template>
  <div class="cart">
    <h1>장바구니</h1>
    <button class="clear-button" @click="allClear">전체 삭제</button>

    <div class="carts">
      <div class="mealkit-cart">
        <h2>밀키트</h2>
        <div class="cart-list">
          <li
            v-for="item in mealKitCartItems"
            :key="item.id"
            class="cart-item"
          >
            <div class="item-info">
              <span>{{ item.name }}</span>
              <div class="quantity-control">
                <button @click="adjustQuantity(item.id, true, false)">-</button>
                <span>{{ item.quantity }}</span>
                <button @click="adjustQuantity(item.id, true, true)">+</button>
              </div>
            </div>
            <div class="setting">
              <button
                class="delete-button"
                @click="removeFromCart(item.id, true)"
              >
                ×
              </button>
              <span>{{ (item.price * item.quantity).toLocaleString() }}원</span>
            </div>
          </li>
        </div>
      </div>

      <div class="laundry-cart">
        <h2>세탁용품</h2>
        <div class="cart-list">
          <li
            v-for="item in laundryCartItems"
            :key="item.id"
            class="cart-item"
          >
            <div class="item-info">
              <span>{{ item.name }}</span>
              <div class="quantity-control">
                <button @click="adjustQuantity(item.id, false, false)">
                  -
                </button>
                <span>{{ item.quantity }}</span>
                <button @click="adjustQuantity(item.id, false, true)">
                  +
                </button>
              </div>
            </div>
            <div class="setting">
              <button
                class="delete-button"
                @click="removeFromCart(item.id, false)"
              >
                ×
              </button>
              <span>{{ (item.price * item.quantity).toLocaleString() }}원</span>
            </div>
          </li>
        </div>
      </div>
    </div>

    <div class="summary">
      <span style="padding: 0 20px 0 10px; font-size: 18px;">
        {{ totalPrice.toLocaleString() }}원
      </span>
      <button class="checkout-button" @click="checkout">구매하기</button>
    </div>
  </div>
</template>

<script setup>
import { useMealKitStore } from "@/store/mealKitStore";
import { useLaundrySuppliesStore } from "@/store/laundrySuppliesStore";
import { computed } from "vue";

const mealKitStore = useMealKitStore();
const laundryStore = useLaundrySuppliesStore();

const mealKitCartItems = computed(() => mealKitStore.cartItems || []);
const laundryCartItems = computed(() => laundryStore.cartItems || []);

const allClear = () => {
  mealKitStore.clearCart();
  laundryStore.clearCart();
};

const removeFromCart = (id, isMealKit) => {
  if (isMealKit) {
    mealKitStore.removeFromCart(id);
  } else {
    laundryStore.removeFromCart(id);
  }
};

const adjustQuantity = (id, isMealKit, increment) => {
  const store = isMealKit ? mealKitStore : laundryStore;
  const cartItem = store.cart.find((item) => item.id === id);
  if (cartItem) {
    cartItem.quantity = Math.max(1, cartItem.quantity + (increment ? 1 : -1));
  }
};

const totalPrice = computed(() => {
  const mealKitTotal = mealKitCartItems.value.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const laundryTotal = laundryCartItems.value.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return mealKitTotal + laundryTotal;
});

const checkout = () => {
  alert(
    `총 결제 금액: ${totalPrice.value.toLocaleString()}원을 결제하시겠습니까?`
  );
};
</script>

<style scoped>
.cart {
  display: flex;
  flex-direction: column;
  width: 530px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-sizing: border-box;
}

.carts {
  background-color: white;
  border-radius: 8px;
  margin: 20px 20px 0px 20px;
  border: 1px solid #ddd;
}

.mealkit-cart {
  background-color: white;
  box-sizing: border-box;
  padding: 20px;
  margin: 20px;
  border-bottom: 1px solid #ddd;
}

.laundry-cart {
  background-color: white;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px;
  margin: 20px;
}

h1 {
  padding: 20px;
  margin: 0;
}

h2 {
  margin: 0 0 15px;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #ddd;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 10px;
}

.item-info {
  display: flex;
  flex-direction: column;
  flex: 2;
  gap: 10px;
  font-size: 14px;
}

.setting {
  display: flex;
  flex-direction: column;
  flex: 2;
  text-align: right;
  justify-content: right;
  font-size: 16px;
  gap: 10px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.quantity-control button {
  width: 25px;
  height: 25px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  cursor: pointer;
}

.quantity-control button:hover {
  background: #eee;
}

.delete-button {
  text-align: right;
  font-size: 20px;
  color: #898989;
  background: none;
  border: none;
  cursor: pointer;
}

.delete-button:hover {
  color: #ff5e23;
}

.summary {
  display: flex;
  flex-direction: column;
  text-align: right;
  margin-top: 20px;
  font-size: 16px;
}

.checkout-button {
  width: 200px;
  padding: 10px 20px;
  background: black;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  margin: 20px;
  margin-left: auto;
}

.checkout-button:hover {
  background: #333;
}

.clear-button {
  width: 100px;
  padding: 10px 20px;
  background-color: #ffffff;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  margin-right: 20px;
  margin-left: auto;
  border: 1px solid #ddd;
}

.clear-button:hover {
  background: #eee;
}
</style>
