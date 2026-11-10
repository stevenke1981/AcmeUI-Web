<script setup lang="ts">
import { computed } from "vue";
import { paginationState } from "@acmeui/core";
const props=defineProps<{page:number;totalPages:number}>();
defineEmits<{(e:"change",page:number):void}>();
const state=computed(()=>paginationState(props.page,props.totalPages));
</script>
<template><nav class="acme-pagination" aria-label="分頁"><button type="button" aria-label="上一頁" :disabled="state.page<=1" @click="$emit('change',Math.max(1,state.page-1))">‹</button><button v-for="p in state.pages" :key="p" type="button" :aria-current="p===state.page?'page':undefined" @click="$emit('change',p)">{{p}}</button><button type="button" aria-label="下一頁" :disabled="state.page>=state.totalPages" @click="$emit('change',Math.min(state.totalPages,state.page+1))">›</button></nav></template>
