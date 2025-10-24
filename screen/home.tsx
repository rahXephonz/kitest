import { useAtomValue } from "jotai";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { FlatList, TouchableOpacity, View, RefreshControl } from "react-native";

import { Text } from "@/components/ui";
import { ShowIf } from "@/components/common";
import { requestsAtom } from "@/state/atoms";
import { useAuth, useFutureEvents } from "@/hooks/useModule";

export const HomeScreen = () => {
  const { currentUser } = useAuth();
  const events = useFutureEvents();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const requests = useAtomValue(requestsAtom);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh - in real app, we might want to expire requests or refetch
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  const formatDate = useCallback((timestamp: number): string => {
    return new Date(timestamp).toLocaleString("en-US", {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
    });
  }, []);

  const getEventStatus = useCallback((event: SportingEvent): string => {
    const now = Date.now();
    if (event.startTime > now) return "Upcoming";
    if (event.endTime > now) return "In Progress";
    return "Completed";
  }, []);

  const getParticipantCount = useCallback(
    (eventId: string): number => {
      return Array.from(requests.values()).filter(req => req.eventId === eventId && req.status === "ACCEPTED").length;
    },
    [requests],
  );

  const renderEventCard = useCallback(
    ({ item: event }: { item: SportingEvent }) => {
      const status = getEventStatus(event);
      const participantCount = getParticipantCount(event.id);
      const spotsLeft = event.maxPlayers - participantCount;

      return (
        <TouchableOpacity
          className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 active:bg-gray-50"
          onPress={() => router.push(`/event-detail?eventId=${event.id}`)}
        >
          {/* Header */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-lg font-bold text-gray-900 mb-1">{event.title}</Text>
              <Text className="text-sm text-gray-500">🏆 {event.sport}</Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${
                status === "Upcoming" ? "bg-blue-100" : status === "In Progress" ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  status === "Upcoming"
                    ? "text-blue-700"
                    : status === "In Progress"
                      ? "text-green-700"
                      : "text-gray-700"
                }`}
              >
                {status}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View className="space-y-2 mb-3">
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">📍 {event.location}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">🕐 {formatDate(event.startTime)}</Text>
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <Text className="text-sm font-semibold text-gray-700">
                {participantCount}/{event.maxPlayers} Players
              </Text>
            </View>
            {spotsLeft > 0 && spotsLeft <= 3 && (
              <View className="bg-amber-100 px-2 py-1 rounded">
                <Text className="text-xs font-semibold text-amber-700">
                  {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
                </Text>
              </View>
            )}
            {spotsLeft === 0 && (
              <View className="bg-red-100 px-2 py-1 rounded">
                <Text className="text-xs font-semibold text-red-700">Full</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [formatDate, getEventStatus, getParticipantCount, router],
  );

  const renderEmptyState = useCallback(
    () => (
      <View className="items-center justify-center py-16 px-6">
        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Text className="text-4xl">🏆</Text>
        </View>
        <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">No Upcoming Events</Text>
        <Text className="text-sm text-gray-500 text-center mb-6">
          Be the first to create an event and get the game started!
        </Text>
        <ShowIf condition={currentUser}>
          {() => (
            <TouchableOpacity
              className="bg-blue-500 px-6 py-3 rounded-lg active:bg-blue-600"
              onPress={() => router.push("/create-event")}
            >
              <Text className="text-white font-semibold">Create Event</Text>
            </TouchableOpacity>
          )}
        </ShowIf>
      </View>
    ),
    [currentUser, router],
  );

  return (
    <View className="flex-1">
      <View className="bg-white border-b border-gray-200">
        <View className="pb-3">
          <ShowIf
            condition={currentUser}
            fallback={
              <View className="py-3">
                <Text className="text-2xl font-bold text-gray-900 mb-2">Welcome to Sports Hub</Text>
                <Text className="text-sm text-gray-600 mb-4">Join and organize sporting events in your area</Text>
                <TouchableOpacity
                  className="bg-blue-500 py-3 rounded-lg items-center active:bg-blue-600"
                  onPress={() => router.push("/login")}
                >
                  <Text className="text-white font-semibold text-base">Login to Get Started</Text>
                </TouchableOpacity>
              </View>
            }
          >
            {user => (
              <View>
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 mb-1">Welcome back,</Text>
                    <Text className="text-2xl font-bold text-gray-900">{user.username}! 👋</Text>
                  </View>
                  <TouchableOpacity
                    className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center"
                    onPress={() => router.push("/profile")}
                  >
                    <Text className="text-white text-xl font-bold">{user.username.charAt(0).toUpperCase()}</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row space-x-2 mb-2">
                  <TouchableOpacity
                    className="flex-1 bg-blue-500 py-3 rounded-lg items-center active:bg-blue-600"
                    onPress={() => router.push("/create-event")}
                  >
                    <Text className="text-white font-semibold text-sm">➕ Create Event</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 py-3 rounded-lg items-center active:bg-gray-200"
                    onPress={() => router.push("/profile")}
                  >
                    <Text className="text-gray-700 font-semibold text-sm">👤 My Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ShowIf>
        </View>
      </View>

      <View className="flex-1">
        <View className="px-4 py-3 bg-white border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-900">Upcoming Events</Text>
            <View className="bg-blue-100 h-9 flex-row items-center justify-center w-9 rounded-full">
              <Text className="text-sm font-semibold text-blue-700">{events.length}</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={renderEventCard}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 80,
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};
