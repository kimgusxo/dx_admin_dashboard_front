<template>
  <div class="laundry-container">
    <div class="laundry-select">
      <label for="laundrySelect">세탁용품을 선택하세요:</label>
      <select
        id="laundrySelect"
        v-model="selectedLaundryId"
      >
        <option
          v-for="laundry in laundryProducts"
          :key="laundry.laundrySuppliesId"
          :value="laundry.laundrySuppliesId"
        >
          {{ laundry.laundrySuppliesName }}
        </option>
      </select>
    </div>

    <div class="laundry-chart">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { Chart } from "chart.js";
import { useLaundrySuppliesStore } from "@/store/laundrySuppliesStore";

const props = defineProps({
  storeId: {
    type: Number,
    default: 1,
  },
});

const laundryStore = useLaundrySuppliesStore();

// 매장별 세탁용품 리스트
const laundryProducts = computed(() =>
  laundryStore.suppliesByStore(props.storeId)
);

// 선택된 세탁용품 ID
const selectedLaundryId = ref(null);

// 선택된 세탁용품 객체
const selectedLaundry = computed(() =>
  laundryProducts.value.find(
    (product) => product.laundrySuppliesId === selectedLaundryId.value
  )
);

const chartInstance = ref(null);
const chartCanvas = ref(null);

// 차트 렌더링
const renderChart = (data) => {
  if (!data) return;

  if (chartInstance.value) {
    chartInstance.value.destroy();
    chartInstance.value = null;
  }

  if (!chartCanvas.value) {
    console.warn("Chart canvas is not available for rendering.");
    return;
  }

  const ctx = chartCanvas.value.getContext("2d");

  const maxSales = Math.max(...data.laundrySuppliesMonthlySalesVolume);
  const stepSize = Math.ceil(maxSales / 10) || 1;

  chartInstance.value = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "1월",
        "2월",
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월",
      ],
      datasets: [
        {
          label: `${data.laundrySuppliesName} 월별 판매량`,
          data: data.laundrySuppliesMonthlySalesVolume,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize,
          },
          min: 0,
          max: Math.ceil(maxSales / stepSize) * stepSize,
        },
      },
    },
  });
};

// 상품 리스트 변경 시 기본 선택값 세팅
watch(
  laundryProducts,
  (list) => {
    if (list.length && !selectedLaundryId.value) {
      selectedLaundryId.value = list[0].laundrySuppliesId;
    }
  },
  { immediate: true }
);

// 선택된 상품 변경 시 차트 업데이트
watch(
  selectedLaundry,
  (newVal) => {
    if (newVal) {
      renderChart(newVal);
    }
  }
);

onMounted(async () => {
  if (!laundryProducts.value.length) {
    await laundryStore.fetchLaundrySupplies(props.storeId);
  }

  if (laundryProducts.value.length && !selectedLaundryId.value) {
    selectedLaundryId.value = laundryProducts.value[0].laundrySuppliesId;
  }

  if (selectedLaundry.value) {
    renderChart(selectedLaundry.value);
  }
});
</script>

<style scoped>
.laundry-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 600px;
  height: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 1rem;
  padding: 20px;
}

.laundry-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
}

.laundry-select label {
  font-size: 16px;
  font-weight: bold;
}

.laundry-select select {
  padding: 5px 10px;
  font-size: 14px;
}

.laundry-chart {
  width: 100%;
  max-width: 600px;
}

canvas {
  max-width: 550px;
  width: 100%;
  height: auto;
}
</style>
