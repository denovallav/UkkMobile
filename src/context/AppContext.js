import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_ORDERS } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState('id');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [storedBookmarks, storedOrders, storedLanguage, storedUser] = await Promise.all([
          AsyncStorage.getItem('bookmarks'),
          AsyncStorage.getItem('orders'),
          AsyncStorage.getItem('language'),
          AsyncStorage.getItem('user'),
        ]);
        if (!active) return;
        if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));
        if (storedOrders) setOrders(JSON.parse(storedOrders));
        if (storedLanguage) setLanguageState(storedLanguage);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        console.log('Error loading stored data:', e);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = async (userData) => {
    const nextUser = { ...userData, id: 'usr_001', avatar: null };
    setUser(nextUser);
    await AsyncStorage.setItem('user', JSON.stringify(nextUser));
  };

  const updateUser = async (changes) => {
    setUser((current) => {
      if (!current) return current;
      const nextUser = { ...current, ...changes };
      AsyncStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const logout = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem('user');
    } catch (e) {
      console.log('Error clearing user session:', e);
    }
  };
  const setLanguage = async (nextLanguage) => {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem('language', nextLanguage);
  };

  const toggleBookmark = async (concert) => {
    const isBookmarked = bookmarks.some((b) => b.id === concert.id);
    let updated;
    if (isBookmarked) {
      updated = bookmarks.filter((b) => b.id !== concert.id);
    } else {
      updated = [...bookmarks, concert];
    }
    setBookmarks(updated);
    await AsyncStorage.setItem('bookmarks', JSON.stringify(updated));
  };

  const isBookmarked = (concertId) => bookmarks.some((b) => b.id === concertId);
  const removeBookmark = async (concertId) => {
    const updated = bookmarks.filter((b) => b.id !== concertId);
    setBookmarks(updated);
    await AsyncStorage.setItem('bookmarks', JSON.stringify(updated));
  };
  const clearBookmarks = async () => {
    setBookmarks([]);
    await AsyncStorage.setItem('bookmarks', JSON.stringify([]));
  };

  const addOrder = async (order) => {
    const updated = [order, ...orders];
    setOrders(updated);
    await AsyncStorage.setItem('orders', JSON.stringify(updated));
  };

  const updateOrderPayment = async (orderId, paymentProof) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, paymentProof, paymentStatus: 'waiting' } : o
    );
    setOrders(updated);
    await AsyncStorage.setItem('orders', JSON.stringify(updated));
  };

  // Dipanggil setelah pembayaran di gateway berhasil — pesanan masuk antrean verifikasi.
  const markOrderPaid = async (orderId) => {
    const paidAt = new Date().toISOString();
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, paymentStatus: 'waiting', paidAt } : o
    );
    setOrders(updated);
    await AsyncStorage.setItem('orders', JSON.stringify(updated));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        updateUser,
        logout,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        removeBookmark,
        clearBookmarks,
        orders,
        addOrder,
        updateOrderPayment,
        markOrderPaid,
        isLoading,
        language,
        setLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
