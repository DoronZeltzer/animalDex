import { AnimalIdentification } from './animal';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type CameraStackParamList = {
  Camera: undefined;
  Scanning: { photoUri: string; base64: string };
  AnimalCard: { identification: AnimalIdentification; photoUri: string };
};

export type CollectionsStackParamList = {
  Collections: undefined;
  Category: { category: 'land' | 'sea' | 'air' };
  Subcategory: { category: 'land' | 'sea' | 'air'; subcategory: string };
  AnimalDetail: { animalId: string };
};

export type FriendsStackParamList = {
  Friends: undefined;
  FriendProfile: { friendId: string; friendName: string };
  Chat: { friendId: string; friendName: string };
  Trade: {
    mode: 'offer' | 'accept';
    friendId?: string;
    friendName?: string;
    tradeId?: string;
    fromUid?: string;
    fromName?: string;
    offeredAnimal?: any;
  };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CollectionsTab: undefined;
  CameraTab: undefined;
  FriendsTab: undefined;
  ProfileTab: undefined;
};
