<script setup lang="ts">
import { Alert, Avatar, Badge, Button, Card, DataTable, FeatureGrid, Field, Hero, Input, Navbar, PricingTable, Progress } from '../../../packages/vue/src/index';
</script>
<template>
  <Navbar brand="Acme" :links="[{ label: 'Docs', href: '#content' }]"><template #action><Button variant="outline">Sign in</Button></template></Navbar>
  <Hero title="Shared layout" description="Semantic components across frameworks."><template #actions><Button>Start</Button></template><template #visual><Card><div class="acme-card__content">Preview</div></Card></template></Hero>
  <main id="content" class="acme-container acme-stack">
    <div class="acme-cluster"><Button>Save</Button><Badge>Ready</Badge><Avatar name="Ada Lovelace" /></div>
    <Card><div class="acme-card__content"><Field label="Name"><Input model-value="Ada" /></Field></div></Card>
    <Alert title="Notice">Shared content</Alert><Progress :value="42" label="Upload" />
    <DataTable caption="Members" :columns="[{ key: 'name', label: 'Name' }]" :rows="[{ name: 'Ada' }]" />
    <FeatureGrid :items="[{ title: 'Fast', description: 'Quick setup' }, { title: 'Shared', description: 'Same tokens' }, { title: 'Open', description: 'Native markup' }]" />
    <PricingTable :plans="[{ name: 'Starter', price: '$0', description: 'Personal', features: ['Tokens'] }, { name: 'Team', price: '$10', description: 'Together', features: ['CLI'], featured: true }]" />
  </main>
</template>
