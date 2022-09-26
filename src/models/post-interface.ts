interface Post {
  id: string;
  isTrip: boolean;
  title: string;
  startDate: Date;
  endDate?: Date;
  imageID?: string;
  content: string;
}
export default Post;
