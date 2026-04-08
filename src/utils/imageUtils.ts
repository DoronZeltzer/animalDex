import * as ImageManipulator from 'expo-image-manipulator';

export async function resizeAndCompressImage(uri: string): Promise<{ uri: string; base64: string }> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return { uri: result.uri, base64: result.base64 ?? '' };
}
