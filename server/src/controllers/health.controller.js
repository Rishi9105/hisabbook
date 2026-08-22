export function getHealth(_req, res) {
  res.status(200).json({
    status: 'OK',
    message: 'HisabBook API is running',
  })
}
