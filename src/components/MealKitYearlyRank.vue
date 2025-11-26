<template>
  <div class="yearly-rank-wrapper">
    <div class="header">
      <h3>{{ selectedYear }}년 밀키트 판매량 순위</h3>
    </div>
    <table>
      <thead>
        <tr>
          <th>순위</th>
          <th>이름</th>
          <th>총 판매량</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(kit, index) in rankedMealKits"
          :key="index"
          class="row"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ kit.mealKitName }}</td>
          <td>{{ kit.totalSales.toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="isLoading" style="text-align:center; margin-top:10px;">
      데이터를 로드 중입니다...
    </p>
    <p
      v-else-if="error"
      style="text-align:center; margin-top:10px; color:red;"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useMealKitStore } from "@/store/mealKitStore";

const props = defineProps({
  storeId: {
    type: Number,
    default: 1,
  },
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
});

const selectedYear = ref(props.year);

const mealKitStore = useMealKitStore();
const rankedMealKits = computed(() => mealKitStore.yearlyRank);
const isLoading = computed(() => mealKitStore.isLoading);
const error = computed(() => mealKitStore.error);

const fetchRankings = async () => {
  await mealKitStore.fetchYearlyRank(props.storeId, selectedYear.value);
};

onMounted(fetchRankings);
</script>

<style scoped>
.yearly-rank-wrapper {
  width: 600px;
  max-width: 600px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h3 {
  width: 100%;
  font-size: 15px;
  font-weight: bold;
  color: #333;
  border-radius: 8px;
  background-color: #FFD1A7;
  padding: 20px;
  margin-top: 0px;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

th {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  text-align: center;
  border-bottom: 2px solid #eee;
  padding: 10px;
}

td {
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
</style>
