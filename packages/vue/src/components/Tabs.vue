<script setup lang="ts">
import{ref,useId}from"vue";
import{tabKeyTarget}from"@acmeui/core";
const props=defineProps<{items:Array<{value:string;label:string;content:string}>;defaultValue?:string}>();
const active=ref(props.defaultValue||props.items[0]?.value);
const base=useId();
const triggers=ref<HTMLButtonElement[]>([]);
function onKeydown(e:KeyboardEvent,index:number){const next=tabKeyTarget(e.key,index,props.items.length);if(next===null)return;e.preventDefault();const item=props.items[next];if(!item)return;active.value=item.value;triggers.value[next]?.focus()}
</script>
<template><div class="acme-tabs"><div class="acme-tabs__list" role="tablist" aria-orientation="horizontal"><button v-for="(item,n) in items" :key="item.value" ref="triggers" :id="`${base}-tab-${n}`" type="button" class="acme-tabs__trigger" role="tab" :aria-selected="active===item.value" :aria-controls="`${base}-panel-${n}`" :tabindex="active===item.value?0:-1" @click="active=item.value" @keydown="onKeydown($event,n)">{{item.label}}</button></div><div v-for="(item,n) in items" v-show="active===item.value" :key="item.value" :id="`${base}-panel-${n}`" role="tabpanel" :aria-labelledby="`${base}-tab-${n}`" tabindex="0" style="padding:1rem 0">{{item.content}}</div></div></template>
