/**
 * Unit tests for AuthProvider and useAuth hook
 * Tests authentication state management via React Context
 */

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import AuthProvider, { AuthContext } from '@/components/auth/AuthProvider';
import { useAuth } from '@/hooks/useAuth';
import {
  signInWithGoogle,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getCurrentUser,
  updateAuthProfile,
  deleteAuthUser,
} from '@/lib/firebase/auth';
import type { User } from 'firebase/auth';

// Mock Firebase Auth functions
vi.mock('@/lib/firebase/auth', () => ({
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getCurrentUser: vi.fn(),
  updateAuthProfile: vi.fn(),
  deleteAuthUser: vi.fn(),
}));

const mockUser: Partial<User> = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
};

describe('AuthProvider', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();
    (onAuthStateChanged as MockedFunction<typeof onAuthStateChanged>).mockReturnValue(
      mockUnsubscribe
    );
  });

  it('should provide loading state initially', async () => {
    (onAuthStateChanged as MockedFunction<typeof onAuthStateChanged>).mockImplementation(
      (callback) => {
        // Simulate initial auth state check
        setTimeout(() => callback(null), 0);
        return mockUnsubscribe;
      }
    );

    const TestComponent = () => {
      const { loading } = useAuth();
      return <div>{loading ? 'Loading...' : 'Loaded'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Loaded')).toBeInTheDocument();
    });
  });

  it('should update user state when auth state changes', async () => {
    let authCallback: ((user: User | null) => void) | null = null;

    (onAuthStateChanged as MockedFunction<typeof onAuthStateChanged>).mockImplementation(
      (callback) => {
        authCallback = callback;
        // Initially no user
        setTimeout(() => callback(null), 0);
        return mockUnsubscribe;
      }
    );

    const TestComponent = () => {
      const { user, loading } = useAuth();
      if (loading) return <div>Loading...</div>;
      return <div>{user ? `User: ${user.email}` : 'No user'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });

    // Simulate user signing in
    await act(async () => {
      if (authCallback) {
        authCallback(mockUser as User);
      }
    });

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });
  });

  it('should call signInWithGoogle when signIn is called', async () => {
    (onAuthStateChanged as MockedFunction<typeof onAuthStateChanged>).mockImplementation(
      (callback) => {
        setTimeout(() => callback(null), 0);
        return mockUnsubscribe;
      }
    );

    (signInWithGoogle as MockedFunction<typeof signInWithGoogle>).mockResolvedValue({
      user: mockUser as User,
    } as any);

    const TestComponent = () => {
      const { signIn } = useAuth();
      return (
        <button onClick={signIn} data-testid="sign-in-button">
          Sign In
        </button>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
    });

    const button = screen.getByTestId('sign-in-button');
    await act(async () => {
      button.click();
    });

    expect(signInWithGoogle).toHaveBeenCalled();
  });

  it('should call firebaseSignOut when signOut is called', async () => {
    (onAuthStateChanged as MockedFunction<typeof onAuthStateChanged>).mockImplementation(
      (callback) => {
        setTimeout(() => callback(mockUser as User), 0);
        return mockUnsubscribe;
      }
    );

    (firebaseSignOut as MockedFunction<typeof firebaseSignOut>).mockResolvedValue(undefined);

    const TestComponent = () => {
      const { signOut } = useAuth();
      return (
        <button onClick={signOut} data-testid="sign-out-button">
          Sign Out
        </button>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('sign-out-button')).toBeInTheDocument();
    });

    const button = screen.getByTestId('sign-out-button');
    await act(async () => {
      button.click();
    });

    expect(firebaseSignOut).toHaveBeenCalled();
  });

  it('should call updateAuthProfile when updateProfile is called', async () => {
    (onAuthStateChanged as MockedFunction<typeof onAuthStateChanged>).mockImplementation(
      (callback) => {
        setTimeout(() => callback(mockUser as User), 0);
        return mockUnsubscribe;
      }
    );

    (updateAuthProfile as MockedFunction<typeof updateAuthProfile>).mockResolvedValue(undefined);

    const TestComponent = () => {
      const { updateProfile } = useAuth();
      return (
        <button
          onClick={() => updateProfile({ displayName: 'Updated Name' })}
          data-testid="update-profile-button"
        >
          Update Profile
        </button>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('update-profile-button')).toBeInTheDocument();
    });

    const button = screen.getByTestId('update-profile-button');
    await act(async () => {
      button.click();
    });

    expect(updateAuthProfile).toHaveBeenCalledWith({ displayName: 'Updated Name' });
  });

  it('should call deleteAuthUser when deleteAccount is called', async () => {
    (onAuthStateChanged as MockedFunction<typeof onAuthStateChanged>).mockImplementation(
      (callback) => {
        setTimeout(() => callback(mockUser as User), 0);
        return mockUnsubscribe;
      }
    );

    (deleteAuthUser as MockedFunction<typeof deleteAuthUser>).mockResolvedValue(undefined);

    const TestComponent = () => {
      const { deleteAccount } = useAuth();
      return (
        <button onClick={deleteAccount} data-testid="delete-account-button">
          Delete Account
        </button>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-account-button')).toBeInTheDocument();
    });

    const button = screen.getByTestId('delete-account-button');
    await act(async () => {
      button.click();
    });

    expect(deleteAuthUser).toHaveBeenCalled();
  });

  it('should handle errors and update error state', async () => {
    (onAuthStateChanged as MockedFunction<typeof onAuthStateChanged>).mockImplementation(
      (callback) => {
        setTimeout(() => callback(null), 0);
        return mockUnsubscribe;
      }
    );

    (signInWithGoogle as MockedFunction<typeof signInWithGoogle>).mockRejectedValue(
      new Error('Sign-in failed')
    );

    const TestComponent = () => {
      const { signIn, error } = useAuth();
      const handleClick = async () => {
        try {
          await signIn();
        } catch {
          // Error is handled by AuthProvider
        }
      };
      return (
        <div>
          <button onClick={handleClick} data-testid="sign-in-button">
            Sign In
          </button>
          {error && <div data-testid="error">{error}</div>}
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
    });

    const button = screen.getByTestId('sign-in-button');
    await act(async () => {
      button.click();
      // Wait for error state to update
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should cleanup observer on unmount', () => {
    (onAuthStateChanged as MockedFunction<typeof onAuthStateChanged>).mockImplementation(
      (callback) => {
        setTimeout(() => callback(null), 0);
        return mockUnsubscribe;
      }
    );

    const { unmount } = render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});

describe('useAuth hook', () => {
  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = consoleError;
  });

  it('should return auth context value when used inside AuthProvider', async () => {
    (onAuthStateChanged as MockedFunction<typeof onAuthStateChanged>).mockImplementation(
      (callback) => {
        setTimeout(() => callback(null), 0);
        return vi.fn();
      }
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('signIn');
    expect(result.current).toHaveProperty('signOut');
    expect(result.current).toHaveProperty('updateProfile');
    expect(result.current).toHaveProperty('deleteAccount');
  });
});

