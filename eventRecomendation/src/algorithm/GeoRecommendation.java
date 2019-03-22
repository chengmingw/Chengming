package algorithm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import db.DBConnection;
import db.DBConnectionFactory;
import entity.Item;

public class GeoRecommendation {
	public List<Item> recommendItems(String userId, double lat, double lon) {
		List<Item> recommendedItems = new ArrayList<>();
		DBConnection conn = DBConnectionFactory.getDBConnection();
		
		//step1 Get all favorite items
		Set<String> favoirteItems = conn.getFavoriteItemIds(userId);
		
		//step2 Get all categories of favorite items, sort by count
		Map<String, Integer> allCategories = new HashMap<>();
		for(String item : favoirteItems) {
			Set<String> categories = conn.getCategories(item); //db queries
			for(String category : categories) {
				if(allCategories.containsKey(category)) {
					allCategories.put(category, allCategories.get(category) + 1);
				} else {
					allCategories.put(category, 1);
				}
			}
		}
		
		//sort by count
		List<Map.Entry<String, Integer>> categoryList = new ArrayList<Map.Entry<String, Integer>>(allCategories.entrySet());
		Collections.sort(categoryList, new Comparator<Map.Entry<String, Integer>>(){
			@Override
			public int compare(Entry<String, Integer> o1, Entry<String, Integer> o2) {
				return Integer.compare(o2.getValue(), o1.getValue());
			}
		});
		
		//step3 Do search based on category, filter out favorite events, sort by distance
		Set<Item> visitedItems = new HashSet<>();
		for(Map.Entry<String, Integer> category : categoryList) {
			List<Item> items = conn.searchItems(lat, lon, category.getKey());
			List<Item> filteredItems = new ArrayList<>();
			for(Item item : items) {
				if(!favoirteItems.contains(item.getItemId()) && !visitedItems.contains(item)) {
					filteredItems.add(item);
				}
			}
			Collections.sort(filteredItems, new Comparator<Item>() {
				@Override
				public int compare(Item o1, Item o2) {
					//return order by increasing order
					return Double.compare(o2.getDistance(), o1.getDistance());
				}
			});
			visitedItems.addAll(filteredItems);
			recommendedItems.addAll(visitedItems);
		}
		
		return recommendedItems;
	}
}
