import { defineStore } from "pinia";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8081";

export const useStoreListStore = defineStore("storeListStore", {
  state: () => ({
    stores: [],
    selectedStore: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchStoreList() {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await axios.get("/stores");
        this.stores = data.map((store) => ({
          storeId: store.storeId,
          storeName: store.storeName,
        }));
      } catch (err) {
        console.error(err);
        this.error = "매장 리스트를 불러오는 데 실패했습니다.";
      } finally {
        this.isLoading = false;
      }
    },

    selectStore(storeId) {
      this.selectedStore =
        this.stores.find((store) => store.storeId === storeId) ?? null;
    },
  },
});
