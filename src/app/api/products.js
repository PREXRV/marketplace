export default async function handler(req, res) {
  const response = await fetch("https://my-backend.up.railway.app/api/products");
  const data = await response.json();
  res.status(200).json(data);
}