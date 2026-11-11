<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, Modal } from '../../../packages/vue/src/index';
const open = ref(false), mounted = ref(true), closes = ref(0), clicks = ref(0);
function close() { closes.value++; open.value = false; }
</script>
<template><main class="acme-container"><h1>Modal isolation</h1>
  <Button id="opener" @click="mounted = true; open = true">Open</Button>
  <Button id="background" @click="clicks++">Background</Button>
  <output id="clicks">{{clicks}}</output><output id="closes">{{closes}}</output>
  <aside id="existing" inert aria-hidden="true">Already inert</aside>
  <Modal v-if="mounted" :open="open" title="Modal isolation" @close="close">
    <p>Background controls are isolated while this dialog is open.</p>
    <label class="acme-field">Name<Input/></label>
    <Button id="done" @click="close">Done</Button>
    <Button id="unmount" @click="mounted = false">Unmount</Button>
  </Modal>
</main></template>
