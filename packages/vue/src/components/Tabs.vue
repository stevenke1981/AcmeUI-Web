<script setup lang="ts">
import{computed,ref,useId,watchEffect}from"vue";
import{assertUniqueTabValues,tabKeyTarget}from"@acmeui/core";
const props=defineProps<{items:Array<{value:string;label:string;content:string}>;defaultValue?:string;label?:string}>();
const validItems=computed(()=>{assertUniqueTabValues(props.items);return props.items});
const active=ref(props.defaultValue??validItems.value[0]?.value);
watchEffect(()=>{if(!validItems.value.some(item=>item.value===active.value))active.value=validItems.value[0]?.value});
const base=useId();
const triggers=ref<Array<HTMLButtonElement|null>>([]);
function onKeydown(e:KeyboardEvent,index:number){if(e.defaultPrevented||e.isComposing)return;const next=tabKeyTarget(e.key,index,validItems.value.length);if(next===null)return;e.preventDefault();const item=validItems.value[next];if(!item)return;active.value=item.value;triggers.value[next]?.focus()}
</script>
<template><div class="acme-tabs"><div class="acme-tabs__list" role="tablist" :aria-label="label||'分頁內容'" aria-orientation="horizontal"><button v-for="(item,n) in validItems" :key="item.value" :ref="el=>{triggers[n]=el as HTMLButtonElement|null}" :id="`${base}-tab-${n}`" type="button" class="acme-tabs__trigger" role="tab" :aria-selected="active===item.value" :aria-controls="`${base}-panel-${n}`" :tabindex="active===item.value?0:-1" @click="active=item.value" @keydown="onKeydown($event,n)">{{item.label}}</button></div><div v-for="(item,n) in validItems" v-show="active===item.value" :key="item.value" :id="`${base}-panel-${n}`" role="tabpanel" :aria-labelledby="`${base}-tab-${n}`" tabindex="0" style="padding:1rem 0">{{item.content}}</div></div></template>
