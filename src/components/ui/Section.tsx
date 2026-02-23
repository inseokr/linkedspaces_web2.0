import { View, FlatList, useWindowDimensions, StyleSheet } from "react-native";

interface SectionProps<T> {
  Header: React.ReactNode;
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactNode;
}

export function Section<T>({ Header, data, renderItem }: SectionProps<T>) {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  if (isWeb) {
    return (
      <View style={styles.webContainer}>
        {Header}
        <View style={styles.webGrid}>
          {data.map((item, index) => renderItem({ item, index }))}
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={{ paddingHorizontal: 20 }}>{Header}</View>
      <FlatList
        data={data}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 40,
  },
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    marginTop: 24,
  },
});
