<template>
  <div class="laundry-table-wrapper">
    <h3>{{ selectedStoreName }}의 세탁용품 리스트</h3>
    <div class="laundry-table">
      <table>
        <thead>
          <tr>
            <th>이름</th>
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
            <th>가격</th>
            <th>재고</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in filteredLaundrySupplies"
            :key="item.laundrySuppliesId"
            class="row"
          >
            <td>{{ item.laundrySuppliesName }}</td>
            <td>{{ item.laundrySuppliesClassification }}</td>
            <td>{{ item.laundrySuppliesPrice.toLocaleString() }} 원</td>
            <td>{{ item.storeCount }}</td>
          </tr>
          <tr v-if="!filteredLaundrySupplies.length && !isLoading">
            <td colspan="4">세탁용품 데이터가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="isLoading" class="loading-text">데이터를 로드 중입니다...</p>
    <p v-else-if="error" class="error-text">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useLaundrySuppliesStore } from "@/store/laundrySuppliesStore";

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

const laundryStore = useLaundrySuppliesStore();

// 필터 상태
const filters = ref({
  category: "all",
});

// 원본 리스트 (매장별)
const laundrySupplies = computed(() =>
  laundryStore.suppliesByStore(props.storeId)
);

// 필터링된 리스트
const filteredLaundrySupplies = computed(() => {
  return laundrySupplies.value.filter((item) => {
    const matchesCategory =
      filters.value.category === "all" ||
      item.laundrySuppliesClassification === filters.value.category;
    return matchesCategory;
  });
});

// 카테고리 목록
const uniqueCategories = computed(() =>
  Array.from(
    new Set(
      laundrySupplies.value.map(
        (item) => item.laundrySuppliesClassification
      )
    )
  )
);

// 로딩/에러
const isLoading = computed(() => laundryStore.isLoading);
const error = computed(() => laundryStore.error);

// 마운트 시 데이터 로드
onMounted(async () => {
  await laundryStore.fetchLaundrySupplies(props.storeId);
});
</script>

<style scoped>
.laundry-table-wrapper {
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

.laundry-table {
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
