<template>
  <div class="meal-kit-table-wrapper">
    <h3>{{ selectedStoreName }}의 밀키트 리스트</h3>
    <div class="meal-kit-table">
      <table>
        <thead>
          <tr>
            <th style="width: 140px; text-align: center;">이름</th>
            <th>
              <div class="filter">
                <select v-model="filters.category">
                  <option value="all">분류</option>
                  <option
                    v-for="category in uniqueCategories"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </option>
                </select>
              </div>
            </th>
            <th>
              <div class="filter">
                <select v-model="filters.foodType">
                  <option value="all">음식 분류</option>
                  <option
                    v-for="type in uniqueFoodTypes"
                    :key="type"
                    :value="type"
                  >
                    {{ type }}
                  </option>
                </select>
              </div>
            </th>
            <th>가격</th>
            <th>재고</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="mealKit in filteredMealKits"
            :key="mealKit.mealKitId"
            class="row"
          >
            <td>{{ mealKit.mealKitName }}</td>
            <td>{{ mealKit.mealKitClassification }}</td>
            <td>{{ mealKit.mealKitFoodClassification }}</td>
            <td>{{ mealKit.mealKitPrice.toLocaleString() }} 원</td>
            <td>{{ mealKit.mealKitCount }}</td>
          </tr>
          <tr v-if="!filteredMealKits.length && !isLoading">
            <td colspan="5">밀키트 데이터가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="isLoading" class="loading-text">데이터를 로드 중입니다...</p>
    <p v-else-if="error" class="error-text">{{ error }}</p>
  </div>
</template>

<script setup>
import { useMealKitStore } from "@/store/mealKitStore";
import { computed, onMounted, ref } from "vue";

const props = defineProps({
  storeId: {
    type: Number,
    default: 1,
  },
  selectedStoreName: {
    type: String,
    default: "매장",
  },
});

const mealKitStore = useMealKitStore();

// 필터 상태 관리
const filters = ref({
  category: "all",
  foodType: "all",
});

// 밀키트 목록
const mealKits = computed(() => mealKitStore.items);

// 필터링된 밀키트
const filteredMealKits = computed(() => {
  return mealKits.value.filter((kit) => {
    const matchesCategory =
      filters.value.category === "all" ||
      kit.mealKitClassification === filters.value.category;
    const matchesFoodType =
      filters.value.foodType === "all" ||
      kit.mealKitFoodClassification === filters.value.foodType;
    return matchesCategory && matchesFoodType;
  });
});

// 고유 카테고리
const uniqueCategories = computed(() =>
  Array.from(
    new Set(mealKits.value.map((kit) => kit.mealKitClassification))
  )
);

// 고유 음식 분류
const uniqueFoodTypes = computed(() =>
  Array.from(
    new Set(mealKits.value.map((kit) => kit.mealKitFoodClassification))
  )
);

const isLoading = computed(() => mealKitStore.isLoading);
const error = computed(() => mealKitStore.error);

// 컴포넌트 마운트 후 밀키트 데이터 로드
onMounted(async () => {
  await mealKitStore.fetchMealKits(props.storeId);
});

// 필터 변경 함수(실제 로직은 computed에서 처리)
const filterMealKits = () => {};

</script>

<style scoped>
.meal-kit-table-wrapper {
  width: 600px;
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
  border-radius: 8px;
  background-color: #FFD1A7;
  padding: 20px;
  margin-top: 0px;
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
  border-color: #FFF7EF;
  background-color: #FFF7EF;
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
  background-color: #FFF7EF;
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
  cursor: default;
}

.loading-text,
.error-text {
  text-align: center;
  font-size: 14px;
  margin-top: 20px;
}

.error-text {
  color: red;
}
</style>
