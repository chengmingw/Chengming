package db;

import java.util.List;
import java.util.Set;

import entity.Item;

public interface DBConnection {
	/**
	 * Close the connection.
	 */
	public void close();

	/**
	 * Insert the favorite items for a user.
	 * 
	 * @param userId
	 * @param itemIds
	 */
	public void setFavoriteItems(String userId, List<String> itemIds);

	/**
	 * Delete the favorite items for a user.
	 * 
	 * @param userId
	 * @param itemIds
	 */
	public void unsetFavoriteItems(String userId, List<String> itemIds);

	/**
	 * Get the favorite item id for a user.
	 * 
	 * @param userId
	 * @return itemIds
	 */
	public Set<String> getFavoriteItemIds(String userId);

	/**
	 * Get the favorite items for a user.
	 * 
	 * @param userId
	 * @return items
	 */
	public Set<Item> getFavoriteItems(String userId);

	/**
	 * Gets categories based on item id
	 * 
	 * @param itemId
	 * @return set of categories
	 */
	public Set<String> getCategories(String itemId);

	/**
	 * Search items near a geolocation and a term (optional).
	 * 
	 * @param lat
	 * @param lon
	 * @param term
	 *            (Nullable)
	 * @return list of items
	 */
	public List<Item> searchItems(double lat, double lon, String term);
	
	/**
	 * Save items into db.
	 * 
	 * @param item
	 */
	public void saveItem(Item item);
	
	/**
	 * Get user's fullname by userId.
	 * 
	 * @param uerId
	 * @return the user's fullname
	 */
	public String getFullname(String uerId);
	
	/**
	 * Verify login with userId and password
	 * 
	 * @param userId
	 * @param password
	 * @return successful login or not
	 */
	public boolean verifyLogin(String userId, String password);
}
