<template>
  <div>
    <div class="monthly-rank-wrapper">
      <div class="header">
        <h3>
          {{ selectedYear }}년 {{ selectedMonth }}월 세탁용품 판매량 순위
          <button class="calendar-btn" @click="togglePopup">
            <img src="./calendar-icon1.png" alt="달력 아이콘" />
          </button>
        </h3>
      </div>

      <table>
        <thead>
          <tr>
            <th>순위</th>
            <th>이름</th>
            <th>판매량</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(supplies, index) in rankedLaundrySupplies"
            :key="index"
            class="row"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ supplies.laundrySuppliesName }}</td>
            <td>{{ supplies.totalSales.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>

      <p v-if="isLoading">데이터를 로드 중입니다...</p>
      <p v-else-if="error" style="text-align: center;">
        {{ error }}
      </p>
    </div>

    <div v-if="isPopupOpen" class="popup-overlay" @click="closePopup">
      <div class="popup-content" @click.stop>
        <div class="popup-header">
          <button @click="prevYear">&lt;</button>
          <span>{{ popupYear }}</span>
          <button @click="nextYear">&gt;</button>
        </div>
        <div class="popup-body">
          <div class="month-grid">
            <button v-for="month in months" :key="month" @click="selectMonth(month)">
              {{ month }}월
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useLaundrySuppliesStore } from "@/store/laundrySuppliesStore";

const props = defineProps({
  storeId: {
    type: Number,
    default: 1,
  },
});

const storeId = computed(() => props.storeId);
const currentDate = new Date();

// 연/월 선택
const selectedYear = ref(currentDate.getFullYear());
const selectedMonth = ref(currentDate.getMonth() + 1);
const popupYear = ref(currentDate.getFullYear());
const isPopupOpen = ref(false);

// Pinia 스토어
const laundryStore = useLaundrySuppliesStore();

const rankedLaundrySupplies = computed(() => laundryStore.monthlyRank);
const isLoading = computed(() => laundryStore.isLoading);
const error = computed(() => laundryStore.error);

// 랭킹 조회
const fetchRankings = async () => {
  await laundryStore.fetchMonthlyRank(
    storeId.value,
    selectedYear.value,
    selectedMonth.value
  );
};

// 팝업 제어
const togglePopup = () => {
  isPopupOpen.value = !isPopupOpen.value;
};

const closePopup = () => {
  isPopupOpen.value = false;
};

const prevYear = () => {
  popupYear.value--;
};

const nextYear = () => {
  popupYear.value++;
};

const selectMonth = (month) => {
  selectedYear.value = popupYear.value;
  selectedMonth.value = month;
  closePopup();
  fetchRankings();
};

// 최초 로드
onMounted(fetchRankings);
</script>

<style scoped>
.monthly-rank-wrapper {
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

.calendar-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  transition: all 0.3s ease;
  margin: 0;
  margin-left: 10px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 8px;
}

.calendar-btn img {
  width: 30px;
  height: 30px;
}

.calendar-btn:hover {
  transform: scale(1.5);
  background-color: #f7f7f7;
  cursor: pointer;
}

h3 {
  display: flex;
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

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  text-align: center;
}

.popup-header span {
  padding: 20px;
}

.popup-header button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #949494;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.month-grid button {
  background: #f5f5f5;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}
</style>
