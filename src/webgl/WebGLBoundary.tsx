"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  onError: () => void;
}

/**
 * Ошибка внутри сцены не должна уносить с собой страницу: контент, навигация
 * и контакты обязаны продолжать работать. При падении уходим в flat-режим.
 */
export class WebGLBoundary extends Component<Props, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[webgl] сцена упала, уходим в flat-режим", error, info);
    this.props.onError();
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}
