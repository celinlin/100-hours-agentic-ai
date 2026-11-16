'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { SignatureKey, SignatureProps } from './list';

function Loading() {
  return <p className="mg-prompt" aria-busy="true">…</p>;
}

/** Each room's own game, loaded only when its object is opened. */
export const SIGNATURE: Record<SignatureKey, ComponentType<SignatureProps>> = {
  c02: dynamic(() => import('./c02'), { loading: Loading }),
  c03: dynamic(() => import('./c03'), { loading: Loading }),
  c04: dynamic(() => import('./c04'), { loading: Loading }),
  c05: dynamic(() => import('./c05'), { loading: Loading }),
  c06: dynamic(() => import('./c06'), { loading: Loading }),
  c07: dynamic(() => import('./c07'), { loading: Loading }),
  c08: dynamic(() => import('./c08'), { loading: Loading }),
  c09: dynamic(() => import('./c09'), { loading: Loading }),
  c10: dynamic(() => import('./c10'), { loading: Loading }),
  c11: dynamic(() => import('./c11'), { loading: Loading }),
  c12: dynamic(() => import('./c12'), { loading: Loading }),
  c13: dynamic(() => import('./c13'), { loading: Loading }),
  c14: dynamic(() => import('./c14'), { loading: Loading }),
};
