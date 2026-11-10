<script setup lang="ts">
import type { VNodeChild } from 'vue';
defineSlots<{cell?(props:{value:unknown;row:Record<string,unknown>;column:{key:string;label:string}}):VNodeChild}>();
defineProps<{columns:Array<{key:string;label:string}>;rows:Array<Record<string,unknown>>;caption?:string}>();</script><template><div class="acme-table-wrap"><table class="acme-table"><caption v-if="caption">{{caption}}</caption><thead><tr><th scope="col" v-for="column in columns" :key="column.key">{{column.label}}</th></tr></thead><tbody><tr v-for="(row,index) in rows" :key="index"><td v-for="column in columns" :key="column.key"><slot name="cell" :value="row[column.key]" :row="row" :column="column">{{String(row[column.key]??'')}}</slot></td></tr></tbody></table></div></template>
