import * as migration_20260723_184946 from './20260723_184946';
import * as migration_20260918_114717_rename_organisme_to_entreprise_add_sigle from './20260918_114717_rename_organisme_to_entreprise_add_sigle';

export const migrations = [
  {
    up: migration_20260723_184946.up,
    down: migration_20260723_184946.down,
    name: '20260723_184946',
  },
  {
    up: migration_20260918_114717_rename_organisme_to_entreprise_add_sigle.up,
    down: migration_20260918_114717_rename_organisme_to_entreprise_add_sigle.down,
    name: '20260918_114717_rename_organisme_to_entreprise_add_sigle'
  },
];
