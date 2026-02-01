package no.clueless.webmention.persistence;

import java.util.List;

public interface WebmentionRepository<IdType> {
    WebmentionRepository<IdType> initialize();

    Webmention getWebmentionById(IdType id);

    Webmention getWebmentionBySourceUrl(String sourceUrl);

    long getApprovedCount();

    List<Webmention> getApprovedWebmentions(int pageNumber, int pageSize, String orderByColumn, String orderByDirection);

    Webmention createWebmention(Webmention webmention);

    Webmention updateWebmention(Webmention webmention);
}
