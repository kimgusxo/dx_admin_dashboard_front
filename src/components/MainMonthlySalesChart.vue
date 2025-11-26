<template>
  <div>
    <div class="monthly-rank-wrapper">
      <div class="header">
        <h3>
          {{ selectedYear }}년 월별 총 매출액
          <button class="calendar-btn" @click="togglePopup">
            <img src="./calendar-icon1.png" alt="달력 아이콘" />
          </button>
        </h3>
      </div>

      <div v-if="!isLoading" class="chart-container">
        <canvas id="revenueChart" v-if="hasRevenueData && !error"></canvas>
        <p v-if="!hasRevenueData && !error" class="no-data">
          해당 연도의 월별 총 매출액 데이터가 없습니다.
        </p>
        <p v-if="error" class="error" style="margin-bottom: 0;">
          {{ selectedYear }}년 월별 총 매출액 데이터가 없습니다.
        </p>
      </div>

      <p v-if="isLoading">데이터를 로드 중입니다...</p>

      <div v-if="isPopupOpen" class="popup-overlay" @click="closePopup">
        <div class="popup-content" @click.stop>
          <div class="popup-body">
            <div class="year-grid">
              <button
                v-for="year in availableYears"
                :key="year"
                @click="selectYear(year)"
                class="year-btn"
              >
                {{ year }}년
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useOrderStatsStore } from "@/store/orderStatsStore";
import { Chart } from "chart.js";

export default {
  name: "MainMonthlySalesChart",
  setup() {
    const storeId = 1;
    const baseYear = 2023;

    const selectedYear = ref(baseYear);
    const popupYear = ref(baseYear);
    const isPopupOpen = ref(false);

    // Pinia Store
    const orderStatsStore = useOrderStatsStore();
    const monthlyRevenue = computed(() => orderStatsStore.monthlyRevenue);
    const isLoading = computed(() => orderStatsStore.isLoading);
    const error = computed(() => orderStatsStore.error);
    const availableYears = computed(() => orderStatsStore.availableYears);

    let chartInstance = null;

    // 총 매출 데이터 여부
    const hasRevenueData = computed(() =>
      monthlyRevenue.value.some((item) => item.totalRevenue > 0)
    );

    // 1~12월 배열에 매출 채우기
    const getProcessedMonthlySales = () => {
      const monthlySales = Array.from({ length: 12 }, () => 0);
      monthlyRevenue.value.forEach((item) => {
        if (item.month >= 1 && item.month <= 12) {
          monthlySales[item.month - 1] = item.totalRevenue;
        }
      });
      return monthlySales;
    };

    // 차트 제거
    const destroyChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
    };

    // 차트 렌더링
    const renderChart = () => {
      destroyChart();
      const canvas = document.getElementById("revenueChart");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
      const revenues = getProcessedMonthlySales();

      chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: months,
          datasets: [
            {
              label: "월별 총 매출액(단위: 원)",
              data: revenues,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgb(75, 192, 192)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback(value) {
                  return value.toLocaleString();
                },
              },
            },
          },
        },
      });
    };

    // 데이터 fetch + 차트 렌더링
    const fetchRevenueData = async () => {
      try {
        await orderStatsStore.fetchMonthlyRevenue(storeId, selectedYear.value);
        if (error.value) {
          destroyChart();
        } else if (hasRevenueData.value) {
          renderChart();
        } else {
          destroyChart();
        }
      } catch {
        destroyChart();
      }
    };

    // 팝업 제어
    const togglePopup = () => {
      isPopupOpen.value = !isPopupOpen.value;
    };

    const closePopup = () => {
      isPopupOpen.value = false;
    };

    const selectYear = (year) => {
      selectedYear.value = year;
      popupYear.value = year;
      closePopup();
      fetchRevenueData();
    };

    // 마운트 시 여러 연도 데이터 미리 조회 + 현재 연도 차트 렌더링
    onMounted(async () => {
      await orderStatsStore.initializeAvailableYears(storeId, [
        baseYear - 1,
        baseYear,
        baseYear + 1,
      ]);
      await fetchRevenueData();
    });

    return {
      selectedYear,
      popupYear,
      isPopupOpen,
      availableYears,
      isLoading,
      error,
      hasRevenueData,
      togglePopup,
      closePopup,
      selectYear,
    };
  },
};
</script>

<style scoped>
.monthly-rank-wrapper {
  width: 600px;
  height: 395px;
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
  background-color: #ffd1a7;
  padding: 20px;
  margin-top: 0px;
}

.chart-container {
  position: relative;
  height: 280px;
  width: 100%;
}

.no-data {
  text-align: center;
  font-size: 16px;
  color: #666;
}

.error {
  text-align: center;
  font-size: 16px;
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

.year-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.year-btn {
  background: #f5f5f5;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}
</style>
