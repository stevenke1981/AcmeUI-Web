<script setup lang="ts">
import type { VNodeChild } from 'vue';
defineSlots<{icon?(props:{item:{title:string;description:string}}):VNodeChild}>();
defineProps<{items:Array<{title:string;description:string}>}>();</script><template><div class="acme-feature-grid"><article class="acme-feature" v-for="item in items" :key="item.title"><slot name="icon" :item="item"/><h3>{{item.title}}</h3><p>{{item.description}}</p></article></div></template>
