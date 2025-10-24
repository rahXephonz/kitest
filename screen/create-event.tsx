import { useState } from "react";
import { useRouter } from "expo-router";
import DatePicker from "react-native-date-picker";
import { Button, TextInput, View, TouchableOpacity } from "react-native";

import { Text } from "@/components/ui";
import { useCreateEvent } from "@/hooks/useModule";

export const CreateEventScreen = () => {
  const createEvent = useCreateEvent();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [sport, setSport] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("10");

  // 1 hour from now
  const [startDate, setStartDate] = useState(new Date(Date.now() + 60 * 60 * 1000));
  // 3 hours from now
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 60 * 60 * 1000));

  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!sport.trim()) newErrors.sport = "Sport is required";
    if (!location.trim()) newErrors.location = "Location is required";

    const players = parseInt(maxPlayers, 10);
    if (isNaN(players) || players < 2) {
      newErrors.maxPlayers = "Must have at least 2 players";
    }

    if (startDate <= new Date()) {
      newErrors.startDate = "Start time must be in the future";
    }

    if (endDate <= startDate) {
      newErrors.endDate = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await createEvent({
      description: description.trim(),
      endTime: endDate.getTime(),
      location: location.trim(),
      maxPlayers: parseInt(maxPlayers, 10),
      sport: sport.trim(),
      startTime: startDate.getTime(),
      title: title.trim(),
    });

    if (result.success) {
      router.back();
    } else {
      alert(result.error);
    }
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString("en-US", {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    // Auto-adjust end date if it's now before start date
    if (endDate <= date) {
      setEndDate(new Date(date.getTime() + 2 * 60 * 60 * 1000));
    }
  };

  const getDuration = (): string => {
    const hours = Math.round((endDate.getTime() - startDate.getTime()) / (60 * 60 * 1000));
    return hours === 1 ? "1 hour" : `${hours} hours`;
  };

  return (
    <View>
      <Text size={24} weight="bold">
        Create New Event
      </Text>

      <View className="my-4">
        <TextInput
          className={`border rounded-lg p-3 text-base ${errors.title ? "border-red-500" : "border-gray-300"}`}
          placeholder="Event Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
        />
        {errors.title && <Text className="text-red-500 text-xs mt-1">{errors.title}</Text>}
      </View>

      <View className="mb-4">
        <TextInput
          className={`border rounded-lg p-3 text-base ${errors.sport ? "border-red-500" : "border-gray-300"}`}
          placeholder="Sport (e.g., Basketball, Soccer)"
          value={sport}
          onChangeText={setSport}
          placeholderTextColor="#999"
        />
        {errors.sport && <Text className="text-red-500 text-xs mt-1">{errors.sport}</Text>}
      </View>

      <View className="mb-4">
        <TextInput
          className="border border-gray-300 rounded-lg p-3 text-base h-24"
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor="#999"
        />
      </View>

      <View className="mb-4">
        <TextInput
          className={`border rounded-lg p-3 text-base ${errors.location ? "border-red-500" : "border-gray-300"}`}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#999"
        />
        {errors.location && <Text className="text-red-500 text-xs mt-1">{errors.location}</Text>}
      </View>

      <View className="mb-4">
        <TextInput
          className={`border rounded-lg p-3 text-base ${errors.maxPlayers ? "border-red-500" : "border-gray-300"}`}
          placeholder="Max Players"
          value={maxPlayers}
          onChangeText={setMaxPlayers}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
        {errors.maxPlayers && <Text className="text-red-500 text-xs mt-1">{errors.maxPlayers}</Text>}
      </View>

      <View className="mb-4">
        <Text className="text-sm font-semibold mb-2 text-gray-700">Start Date & Time</Text>
        <TouchableOpacity
          className={`border rounded-lg p-3 bg-gray-50 ${errors.startDate ? "border-red-500" : "border-gray-300"}`}
          onPress={() => setOpenStartPicker(true)}
        >
          <Text className="text-base text-gray-800">{formatDateTime(startDate)}</Text>
        </TouchableOpacity>
        {errors.startDate && <Text className="text-red-500 text-xs mt-1">{errors.startDate}</Text>}

        <DatePicker
          modal
          open={openStartPicker}
          date={startDate}
          mode="datetime"
          minimumDate={new Date()}
          onConfirm={date => {
            setOpenStartPicker(false);
            handleStartDateChange(date);
          }}
          onCancel={() => {
            setOpenStartPicker(false);
          }}
          title="Select Start Time"
          confirmText="Confirm"
          cancelText="Cancel"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-semibold mb-2 text-gray-700">End Date & Time</Text>
        <TouchableOpacity
          className={`border rounded-lg p-3 bg-gray-50 ${errors.endDate ? "border-red-500" : "border-gray-300"}`}
          onPress={() => setOpenEndPicker(true)}
        >
          <Text className="text-base text-gray-800">{formatDateTime(endDate)}</Text>
        </TouchableOpacity>
        {errors.endDate && <Text className="text-red-500 text-xs mt-1">{errors.endDate}</Text>}

        <DatePicker
          modal
          open={openEndPicker}
          date={endDate}
          mode="datetime"
          minimumDate={startDate}
          onConfirm={date => {
            setOpenEndPicker(false);
            setEndDate(date);
          }}
          onCancel={() => {
            setOpenEndPicker(false);
          }}
          title="Select End Time"
          confirmText="Confirm"
          cancelText="Cancel"
        />
      </View>

      <View className="bg-gray-100 p-3 rounded-lg mb-4">
        <Text className="text-sm text-gray-600 text-center">Duration: {getDuration()}</Text>
      </View>

      <View className="mt-2">
        <Button title="Create Event" onPress={handleCreate} />
      </View>
    </View>
  );
};
