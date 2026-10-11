import { TabBar, type NavItem } from '@components';
import { useStore } from './state/store';
import { useRoute, go } from './state/router';
import { Onboarding } from './screens/Onboarding';
import { Today } from './screens/Today';
import { CheckIn } from './screens/CheckIn';
import { Drafts } from './screens/Drafts';
import { Talk } from './screens/Talk';
import { Help } from './screens/Help';
import { You } from './screens/You';

/**
 * IA: five destinations, ordered by how often they're needed. Check in is the
 * primary action (centre). Help is a top-level tab, never buried in a menu.
 */
const NAV: NavItem[] = [
  { id: 'today', label: 'today', icon: 'home', href: '#/today' },
  { id: 'drafts', label: 'drafts', icon: 'journal', href: '#/drafts' },
  { id: 'checkin', label: 'check in', icon: 'sprout', href: '#/checkin' },
  { id: 'talk', label: 'remi', icon: 'message', href: '#/talk' },
  { id: 'help', label: 'help', icon: 'phone', href: '#/help' },
];

export function App() {
  const { state } = useStore();
  const [top, sub] = useRoute();

  if (!state.settings.onboarded) return <Onboarding />;

  const current = NAV.some((n) => n.id === top) ? top : 'today';
  let screen;
  switch (top) {
    case 'checkin': screen = <CheckIn />; break;
    case 'drafts': screen = <Drafts id={sub} />; break;
    case 'talk': screen = <Talk />; break;
    case 'help': screen = <Help sub={sub} />; break;
    case 'you': screen = <You />; break;
    default: screen = <Today />;
  }
  return (
    <div className={`app-shell${top === 'talk' ? ' app-shell--talk' : ''}`}>
      <a href="#main" className="rd-btn rd-btn--sm app-skip" onClick={(e) => (e.preventDefault(), document.getElementById('main')?.focus())}>
        skip to content
      </a>
      <main id="main" tabIndex={-1} className="app-main">
        {screen}
      </main>
      <div className="app-nav">
        <TabBar items={NAV} current={current} primary="checkin" onNavigate={(id) => go(`/${id}`)} />
      </div>
    </div>
  );
}
