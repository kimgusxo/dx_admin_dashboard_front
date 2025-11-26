<template>
  <div class="meal-kit-table-wrapper">
    <h3>재고 부족 밀키트 리스트 (20개 미만)</h3>
    <div class="meal-kit-table">
      <table>
        <thead>
          <tr>
            <th style="width: 150px;">이름</th>
            <th>
              <select v-model="selectedClassification">
                <option value="">분류</option>
                <option
                  v-for="classification in classifications"
                  :key="classification"
                  :value="classification"
                >
                  {{ classification }}
                </option>
              </select>
            </th>
            <th>
              <select v-model="selectedFoodClassification">
                <option value="">음식 분류</option>
                <option
                  v-for="foodClassification in foodClassifications"
                  :key="foodClassification"
                  :value="foodClassification"
                >
                  {{ foodClassification }}
                </option>
              </select>
            </th>
            <th>가격</th>
            <th @click="toggleSortOrder" style="cursor: pointer;">
              재고
              <span v-if="sortOrder === 'asc'">▲</span>
              <span v-else>▼</span>
            </th>
            <th>장바구니</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="kit in sortedItems" :key="kit.mealKitId">
            <td>{{ kit.mealKitName }}</td>
            <td>{{ kit.mealKitClassification }}</td>
            <td>{{ kit.mealKitFoodClassification }}</td>
            <td>{{ kit.mealKitPrice.toLocaleString() }}원</td>
            <td>{{ kit.mealKitCount }}</td>
            <td>
              <button @click="addToCart(kit.mealKitId)" class="button">
                담기
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useMealKitStore } from "@/store/mealKitStore";
import { storeToRefs } from "pinia";
import { ref, computed, onMounted } from "vue";

const mealKitStore = useMealKitStore();
const { lowStockMealKits } = storeToRefs(mealKitStore);

const selectedClassification = ref("");
const selectedFoodClassification = ref("");
const sortOrder = ref("asc");

const filteredItems = computed(() =>
  lowStockMealKits.value.filter((kit) => {
    const matchesClassification =
      !selectedClassification.value ||
      kit.mealKitClassification === selectedClassification.value;
    const matchesFoodClassification =
      !selectedFoodClassification.value ||
      kit.mealKitFoodClassification === selectedFoodClassification.value;
    return matchesClassification && matchesFoodClassification;
  })
);

const sortedItems = computed(() =>
  [...filteredItems.value].sort((a, b) => {
    return sortOrder.value === "asc"
      ? a.mealKitCount - b.mealKitCount
      : b.mealKitCount - a.mealKitCount;
  })
);

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

const addToCart = (id) => {
  mealKitStore.addToCart(id);
};

const classifications = computed(() => [
  ...new Set(lowStockMealKits.value.map((kit) => kit.mealKitClassification)),
]);

const foodClassifications = computed(() => [
  ...new Set(
    lowStockMealKits.value.map((kit) => kit.mealKitFoodClassification)
  ),
]);

onMounted(async () => {
  const storeId = 1;
  await mealKitStore.fetchMealKits(storeId);
});
</script>

<style scoped>
.meal-kit-table-wrapper {
  width: 700px;
  height: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 1rem;
  padding: 20px;
  overflow: hidden;
}

h3 {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.meal-kit-table {
  max-height: 80%;
  overflow-x: hidden;
  overflow-y: auto;
}

select {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  border-color: #fff7ef;
  background-color: #fff7ef;
  padding: 0;
}

option {
  background-color: white;
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

option:hover {
  transform: scale(1.02);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #fff7ef;
}

thead th {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  text-align: left;
  border-bottom: 2px solid #eee;
  padding: 15px;
}

tbody td {
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding: 15px;
}

.row:hover {
  transform: scale(1.02);
}

.row {
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.button {
  color: #ffd1a7;
  background-color: #ff5e23;
  font-size: 15px;
  display: block;
  margin: 10px 0;
  border: 2px solid transparent;
  border-radius: 6px;
  transition: all 0.3s ease;
  text-align: center;
}

.button:hover {
  transform: scale(1.1);
  background-color: #ededed;
  color: #ff5e23;
  cursor: pointer;
}
</style>
