function GoogleMapLink({ address }: { address: string }) {
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address || ""
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-blue-600 hover:underline truncate"
    >
      {address}
    </a>
  );
}
export default GoogleMapLink;
