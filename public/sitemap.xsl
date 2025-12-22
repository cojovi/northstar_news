<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9" exclude-result-prefixes="sitemap s">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap - The Northstar Ledger</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 14px;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          h1 {
            color: #2c3e50;
            margin-top: 0;
            font-size: 28px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 15px;
          }
          .intro {
            background-color: #ecf0f1;
            padding: 15px;
            border-left: 4px solid #3498db;
            margin: 20px 0;
            border-radius: 4px;
          }
          .intro p {
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #3498db;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
          }
          tr:hover {
            background-color: #f8f9fa;
          }
          a {
            color: #3498db;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .url-col {
            word-break: break-all;
          }
          .date-col {
            white-space: nowrap;
            color: #666;
          }
          .priority-col, .changefreq-col {
            text-align: center;
            color: #666;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 13px;
          }
          .count {
            background-color: #3498db;
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>XML Sitemap - The Northstar Ledger</h1>

          <div class="intro">
            <p><strong>This is a sitemap for search engines.</strong></p>
            <p>Search engines like Google use sitemaps to discover and index pages on websites more efficiently.</p>
            <xsl:if test="s:sitemapindex">
              <p>This sitemap index contains <span class="count"><xsl:value-of select="count(s:sitemapindex/s:sitemap)"/></span> sub-sitemaps.</p>
            </xsl:if>
            <xsl:if test="s:urlset">
              <p>This sitemap contains <span class="count"><xsl:value-of select="count(s:urlset/s:url)"/></span> URLs.</p>
            </xsl:if>
          </div>

          <!-- Sitemap Index -->
          <xsl:if test="s:sitemapindex">
            <table>
              <thead>
                <tr>
                  <th style="width: 70%">Sitemap URL</th>
                  <th style="width: 30%">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:sitemapindex/s:sitemap">
                  <tr>
                    <td class="url-col">
                      <a href="{s:loc}">
                        <xsl:value-of select="s:loc"/>
                      </a>
                    </td>
                    <td class="date-col">
                      <xsl:value-of select="s:lastmod"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>

          <!-- URL Set -->
          <xsl:if test="s:urlset">
            <table>
              <thead>
                <tr>
                  <th style="width: 50%">Page URL</th>
                  <th style="width: 20%">Last Modified</th>
                  <th style="width: 15%">Change Freq</th>
                  <th style="width: 15%">Priority</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td class="url-col">
                      <a href="{s:loc}">
                        <xsl:value-of select="s:loc"/>
                      </a>
                    </td>
                    <td class="date-col">
                      <xsl:value-of select="s:lastmod"/>
                    </td>
                    <td class="changefreq-col">
                      <xsl:value-of select="s:changefreq"/>
                    </td>
                    <td class="priority-col">
                      <xsl:value-of select="s:priority"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>

          <div class="footer">
            <p>Generated by The Northstar Ledger sitemap generator</p>
            <p>Learn more about sitemaps: <a href="https://www.sitemaps.org/" target="_blank">sitemaps.org</a></p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
