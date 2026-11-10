import { expectTypeOf, it } from 'vitest';
import type { ComponentProps } from 'react';
import { DataTable, type DataTableColumn, type ButtonProps, type SwitchProps } from '../../packages/react/src/index';
import * as VueUI from '../../packages/vue/src/index';
import { cx, initials, tabKeyTarget } from '../../packages/core/src/index';
import { expect } from 'vitest';

it('keeps public props typed, including native controls, generic rows and Vue slots', () => {
  expectTypeOf<ButtonProps['type']>().toEqualTypeOf<'button' | 'submit' | 'reset' | undefined>();
  expectTypeOf<SwitchProps['onCheckedChange']>().toEqualTypeOf<((value: boolean) => void) | undefined>();
  type Row = { name: string; count: number };
  expectTypeOf<DataTableColumn<Row>['key']>().toEqualTypeOf<keyof Row>();
  expectTypeOf<ComponentProps<typeof DataTable<Row>>['rows']>().toEqualTypeOf<Row[]>();
  expectTypeOf<InstanceType<typeof VueUI.Navbar>['$props']['brand']>().toEqualTypeOf<string>();
  expectTypeOf<InstanceType<typeof VueUI.Hero>['$props']['title']>().toEqualTypeOf<string>();
  expectTypeOf<InstanceType<typeof VueUI.DataTable>['$props']['rows']>().toEqualTypeOf<Record<string, unknown>[]>();
  expectTypeOf<Parameters<NonNullable<InstanceType<typeof VueUI.DataTable>['$slots']['cell']>>[0]['value']>().toEqualTypeOf<unknown>();
  // @ts-expect-error a column must name an actual row field
  const badColumn: DataTableColumn<Row> = { key: 'missing', label: 'Missing' };
  void badColumn;
});
it('core helpers preserve class order and bounded initials/keyboard targets', () => {
  expect(cx('base', false, undefined, null, 'custom')).toBe('base custom');
  expect(initials('  Ada   Lovelace Byron ')).toBe('AL'); expect(initials('')).toBe('');
  expect(initials('   ')).toBe(''); expect(initials('林')).toBe('林');
  expect(tabKeyTarget('ArrowLeft', 0, 3)).toBe(2); expect(tabKeyTarget('ArrowRight', 2, 3)).toBe(0);
  expect(tabKeyTarget('Home', 2, 3)).toBe(0); expect(tabKeyTarget('End', 0, 3)).toBe(2);
  expect(tabKeyTarget('ArrowRight', 0, 0)).toBeNull(); expect(tabKeyTarget('Enter', 0, 3)).toBeNull();
});
