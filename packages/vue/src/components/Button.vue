<script setup lang="ts">
withDefaults(defineProps<{variant?:"primary"|"secondary"|"outline"|"ghost";loading?:boolean;disabled?:boolean;type?:"button"|"submit"|"reset"}>(),{variant:"primary",loading:false,disabled:false,type:"button"});
</script>
<template><button class="acme-button" :class="`acme-button--${variant}`" :type="type" :disabled="disabled||loading" :aria-busy="loading||undefined"><template v-if="loading">載入中…</template><slot v-else/></button></template>
