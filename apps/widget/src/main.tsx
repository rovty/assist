import { render } from 'preact';
import { Widget } from './components/Widget';
import type { AssistConfig } from './types';
import './styles/widget.css';

function init() {
  const config: AssistConfig = window.AssistConfig ?? { workspaceId: '' };

  if (!config.workspaceId) {
    console.warn('[Assist Widget] Missing workspaceId in AssistConfig');
    return;
  }

  const container = document.createElement('div');
  container.id = 'assist-widget-root';
  document.body.appendChild(container);

  render(<Widget config={config} />, container);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
