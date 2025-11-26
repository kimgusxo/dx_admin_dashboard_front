// src/store/orderStatsStore.js
import { defineStore } from "pinia";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8081";

export const useOrderStatsStore = defineStore("orderStatsStore", {
  state: () => ({
    monthlyRevenue: [],      // [{ month, totalRevenue }]
    monthlyVisitors: [],     // [{ month, visitorCount }]
    availableYears: [],      // 사용 가능한 연도 목록
    isLoading: false,
    error: null,
  }),

  actions: {
    // 월별 매출
    async fetchMonthlyRevenue(storeId, year) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await axios.get("/orders/month/revenue", {
          params: { storeId, year },
        });

        this.monthlyRevenue = data ?? [];

        // totalRevenue > 0인 데이터가 있으면 사용 가능 연도로 추가
        const hasRevenue = this.monthlyRevenue.some(
          (item) => item.totalRevenue > 0
        );
        if (hasRevenue && !this.availableYears.includes(year)) {
          this.availableYears.push(year);
          this.availableYears.sort((a, b) => b - a);
        }
      } catch (err) {
        console.error(err);
        this.error = "월별 매출 데이터를 불러오는 데 실패했습니다.";
        this.monthlyRevenue = [];
      } finally {
        this.isLoading = false;
      }
    },

    // 월별 방문자 수
    async fetchMonthlyVisitors(storeId, year) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await axios.get("/orders/month/visitorCount", {
          params: { storeId, year },
        });

        this.monthlyVisitors = data ?? [];
      } catch (err) {
        console.error(err);
        this.error = "월별 방문자 수 데이터를 불러오는 데 실패했습니다.";
        this.monthlyVisitors = [];
      } finally {
        this.isLoading = false;
      }
    },

    // 여러 연도 초기화
    async initializeAvailableYears(storeId, years) {
      this.availableYears = [];
      for (const year of years) {
        await this.fetchMonthlyRevenue(storeId, year);
      }
    },
  },
});
