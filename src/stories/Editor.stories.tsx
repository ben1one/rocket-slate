import React, { useCallback, useMemo, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism.css';

import { RocketSlate, RocketToolbar, RocketToolbarGroup, initialValue } from '@rocket-slate/core';
import { RocketToolbarButtons, RocketWysiwygButton, RocketWysiwygPlugin } from '@rocket-slate/wysiwyg';
import { RocketSlateChecklistPlugin, RocketSlateChecklistButton } from '@rocket-slate/checklist';
import { RocketSlateMentionPlugin, RocketSlateMentionSelect, IMention } from '@rocket-slate/mentions';
import { RocketSlateLinksPlugin, RocketSlateLinksButton } from '@rocket-slate/links';
import { RocketSlateImagePlugin, RocketSlateButtonImage } from '@rocket-slate/image';
import {
  RocketSlateCodeInlinePlugin,
  RocketSlateCodePlugin,
  RocketSlateCodeButton,
  RocketSlateCodeInlineButton,
  escapeHTML,
} from '@rocket-slate/code';
import { RocketSlateUploadPlugin, RocketSlateUploadButton, RocketSlateUploadProgress } from '@rocket-slate/upload';

import editorStateNew from '../converter/editorStateNew.json';
import editorStateOld from '../converter/editorStateOld.json';
import { convertSlateState47toRocketSlate } from '../converter';

const fakeUser: IMention[] = [
  { id: 1, text: 'User 1', type: 'user' },
  { id: 2, text: 'User 2', type: 'user' },
  { id: 3, text: 'User 3', type: 'user' },
  { id: 4, text: 'User 4', type: 'user' },
  { id: 5, text: 'User 5', type: 'user' },
];

const fakeTasks: IMention[] = [
  { id: 1, text: 'Task 1', type: 'task' },
  { id: 2, text: 'Task 2', type: 'task' },
  { id: 3, text: 'Task 3', type: 'task' },
  { id: 4, text: 'Task 4', type: 'task' },
  { id: 5, text: 'Task 5', type: 'task' },
];

let timeOutId: number | undefined;

const languagesList = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'rb', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'php', label: 'PHP' },
  { value: 'sql', label: 'SQL' },
  { value: 'markup', label: 'HTML' },
  { value: 'css', label: 'CSS' },
];

const fakeProgress = (duration, onProgress, onComplete) => {
  const start = performance.now();
  requestAnimationFrame(function tick(time) {
    let progress = (time - start) / duration;
    if (progress > 1) {
      progress = 1;
    }
    onProgress(Math.floor(progress * 100));
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      onComplete();
    }
  });
};

storiesOf('Editor', module).add('default', () => {
  const plugins = useMemo(
    () => [
      RocketWysiwygPlugin(),
      RocketSlateChecklistPlugin(),
      RocketSlateMentionPlugin(),
      RocketSlateLinksPlugin(),
      RocketSlateImagePlugin(),
      RocketSlateCodeInlinePlugin(),
      RocketSlateCodePlugin({
        highlight: (code, lang) => {
          if (lang !== undefined && languages[lang] !== undefined) {
            return highlight(code, languages[lang], lang);
          }
          return escapeHTML(code);
        },
        languages: languagesList,
      }),
      RocketSlateUploadPlugin({
        onInsertFile: (file, onComplete, onError, onProgress) => {
          fakeProgress(1000 + Math.random() * (5000 - 1000), onProgress, () => {
            const url = URL.createObjectURL(file);
            onComplete({ url, name: file.name, id: Math.round(Math.random() * 1000) });
          });
        },
      }),
    ],
    [],
  );

  const initialState = useMemo(() => {
    return convertSlateState47toRocketSlate(editorStateOld) || editorStateNew || initialValue;
  }, []);
  const [editorValue, setValue] = useState(initialState);
  const [isLoading, setLoading] = useState(false);
  const [mentions, setMention] = useState<IMention[]>([]);

  const handlerChangeSearchMention = useCallback((search, searchPrefix) => {
    setLoading(true);
    clearTimeout(timeOutId);
    if (search !== null && search !== undefined) {
      if (searchPrefix === '@') {
        timeOutId = setTimeout(() => {
          setMention(fakeUser);
          setLoading(false);
        }, 1000);
      }
      if (searchPrefix === '#') {
        timeOutId = setTimeout(() => {
          setMention(fakeTasks);
          setLoading(false);
        }, 1000);
      }
    } else {
      setMention([]);
      setLoading(false);
    }
  }, []);

  const handlerChangeValue = useCallback((value) => {
    // console.log('value', JSON.stringify(value));
    setValue(value);
  }, []);

  return (
    <RocketSlate
      plugins={plugins}
      value={editorValue}
      onChange={handlerChangeValue}
      before={
        <RocketToolbar>
          <RocketToolbarGroup>
            <RocketWysiwygButton format={RocketToolbarButtons.H1} />
            <RocketWysiwygButton format={RocketToolbarButtons.H2} />
            <RocketWysiwygButton format={RocketToolbarButtons.H3} />
          </RocketToolbarGroup>
          <RocketToolbarGroup>
            <RocketWysiwygButton format={RocketToolbarButtons.BOLD} />
            <RocketWysiwygButton format={RocketToolbarButtons.ITALIC} />
            <RocketWysiwygButton format={RocketToolbarButtons.UNDERLINE} />
            <RocketWysiwygButton format={RocketToolbarButtons.STRIKETHROUGH} />
            <RocketWysiwygButton format={RocketToolbarButtons.BLOCKQUOTE} />
          </RocketToolbarGroup>
          <RocketToolbarGroup>
            <RocketWysiwygButton format={RocketToolbarButtons.UL} />
            <RocketWysiwygButton format={RocketToolbarButtons.OL} />
            <RocketSlateChecklistButton />
          </RocketToolbarGroup>
          <RocketToolbarGroup>
            <RocketSlateCodeInlineButton />
            <RocketSlateCodeButton />
          </RocketToolbarGroup>
          <RocketToolbarGroup>
            <RocketSlateLinksButton />
            <RocketSlateButtonImage />
            <RocketSlateUploadButton />
          </RocketToolbarGroup>
        </RocketToolbar>
      }
      after={
        <>
          <RocketSlateMentionSelect
            mentions={mentions}
            prefix={['@', '#']}
            onChangeSearch={handlerChangeSearchMention}
            isLoading={isLoading}
          />
          <RocketSlateUploadProgress />
        </>
      }
    />
  );
});
