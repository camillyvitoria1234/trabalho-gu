/**
 * Testes unitários para o sistema narrativo (src/gameplay/story.js).
 * Satisfaz: NARR-001, NARR-002, NARR-003, NARR-004, NARR-008, NARR-010.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { STORY_DIALOGUES, getDialogueForTrack, validateDialogues } from '../src/gameplay/story.js';

describe('Story & Narrative System (Marco M3)', () => {
  it('contains valid dialogues and passes integrity validation', () => {
    const result = validateDialogues(STORY_DIALOGUES);
    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
  });

  it('covers all 11 tracks with intro dialogues and original character KRONA (M4-01, NARR-003, NARR-004)', () => {
    const trackIds = [
      'track-01-proto',
      'track-02-arc',
      'track-03-loop',
      'track-04-rush',
      'track-05-bifurcation',
      'track-06-gravity',
      'track-07-turbo',
      'track-08-nexus',
      'track-09-cipher',
      'track-10-fragments',
      'track-11-singularity'
    ];

    for (const id of trackIds) {
      const intro = getDialogueForTrack(id, 'beforeStart');
      assert.ok(intro, `Fase ${id} deve possuir diálogo inicial`);
      assert.equal(intro.speaker, 'KRONA');
      assert.ok(intro.lines.length >= 2, `Fase ${id} deve possuir ao menos 2 linhas`);

      const finish = getDialogueForTrack(id, 'onFinish');
      assert.ok(finish, `Fase ${id} deve possuir diálogo de conclusão`);
      assert.equal(finish.speaker, 'KRONA');
      assert.ok(finish.lines.length >= 2, `Fase ${id} deve possuir ao menos 2 linhas`);
    }
  });

  it('filters out already seen dialogues when isSeenFn returns true', () => {
    const seenMap = new Set(['dial-01-start']);
    const isSeen = (id) => seenMap.has(id);

    // Diálogo já visto retorna null
    const unseen = getDialogueForTrack('track-01-proto', 'beforeStart', isSeen);
    assert.equal(unseen, null);

    // Diálogo não visto retorna o objeto do diálogo
    const available = getDialogueForTrack('track-01-proto', 'onFinish', isSeen);
    assert.ok(available);
    assert.equal(available.id, 'dial-01-finish');
  });

  it('validates and rejects corrupted dialogues', () => {
    const badDialogues = [
      { id: 'dup', trackId: 'track-01', trigger: 'beforeStart', speaker: 'K', lines: ['A'] },
      { id: 'dup', trackId: 'track-02', trigger: 'beforeStart', speaker: 'K', lines: ['B'] }, // ID duplicado
      { id: 'no-trigger', trackId: 'track-01', trigger: 'invalid', speaker: 'K', lines: ['C'] },
      { id: 'no-lines', trackId: 'track-01', trigger: 'onFinish', speaker: 'K', lines: [] }
    ];

    const result = validateDialogues(badDialogues);
    assert.equal(result.valid, false);
    assert.ok(result.errors.length >= 3);
  });
});
